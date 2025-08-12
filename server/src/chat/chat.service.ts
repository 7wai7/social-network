import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateMessageDto } from 'src/dto/create-message.dto';
import { Chat } from 'src/models/chat.model';
import { ChatParticipants } from 'src/models/chatParticipants.model';
import { User } from 'src/models/users.model';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Files } from 'src/models/files.model';
import { Messages, MessagesCreationAttrs } from 'src/models/messages.model';
import { MessageFiles } from 'src/models/messageFiles.model';
import { StorageService } from 'src/storage/storage.service';
import { UpdateMessageDto } from 'src/dto/update-message.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat) private chatModel: typeof Chat,
        @InjectModel(ChatParticipants) private chatParticipantsModel: typeof ChatParticipants,
        @InjectModel(Messages) private messagesModel: typeof Messages,
        @InjectModel(MessageFiles) private messageFilesModel: typeof MessageFiles,
        @InjectModel(Files) private filesModel: typeof Files,
        @Inject(Sequelize) private readonly sequelize: Sequelize,
        private readonly storageService: StorageService,
    ) { }

    async getUserChats(userId: number) {
        const chats = await this.sequelize.query(`
            SELECT 
            chats.*,
            other_users.id AS other_user_id,
            other_users.login AS other_user_login,
            other_users.email AS other_user_email
            FROM chats
            JOIN chat_participants AS cp1 ON chats.id = cp1.chat_id
            JOIN chat_participants AS cp2 ON chats.id = cp2.chat_id
            JOIN users AS other_users ON cp2.user_id = other_users.id
            WHERE cp1.user_id = ${userId}
            AND cp2.user_id != ${userId}
            `)

        return chats[0];
    }

    async findUsersAndChatsByLogin(userId: number, login: string) {
        const chats = await this.sequelize.query(`
            SELECT 
            u.id AS user_id,
            u.login,
            c.id AS chat_id,
            c."isGroup",
            c.title
            FROM users u
            LEFT JOIN (
                SELECT 
                    cp1.user_id,
                    cp1.chat_id,
                    c.id,
                    c."isGroup",
                    c.title
                FROM chat_participants cp1
                INNER JOIN chat_participants cp2 ON cp2.chat_id = cp1.chat_id AND cp2.user_id = ${userId}
                INNER JOIN chats c ON c.id = cp1.chat_id
            ) c ON c.user_id = u.id
            WHERE u.id != ${userId} AND u.login ILIKE '%${login}%'
            ORDER BY u.login
            `)

        // console.log(chats[0]);
        return chats[0]
    }

    async getChatMessages(
        userId: number,
        chatId: number,
        cursor?: string,
        limit: number = 30
    ): Promise<Messages[]> {
        const where: any = {
            chat_id: chatId
        };

        if (cursor) {
            where.createdAt = { [Op.lt]: cursor };
        }

        const include = [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'login']
            },
            {
                model: Files,
                as: 'files',
                through: { attributes: [] },
                required: false
            }
        ];

        const messages = await this.messagesModel.scope(Messages.withOwnership(userId)).findAll({
            where,
            include,
            order: [['createdAt', 'DESC']],
            limit
        });

        // console.log(messages);
        return messages;
    }


    async createChatIfNotExists(message: CreateMessageDto) {
        if (message.user_id === message.recipient_id) throw new HttpException('Cannot create chat with yourself', HttpStatus.FORBIDDEN);

        const existingChat = await this.chatModel.findByPk(message.chat_id, { raw: true });
        if (existingChat) return existingChat.id;

        const chatWithTwoUsers: any = await this.sequelize.query(`
            SELECT c.id
            FROM chats c
            INNER JOIN chat_participants cp1 ON cp1.chat_id = c.id AND cp1.user_id = ${message.user_id}
            INNER JOIN chat_participants cp2 ON cp2.chat_id = c.id AND cp2.user_id = ${message.recipient_id}
            WHERE c."isGroup" = false
            `)
        const id = chatWithTwoUsers[0]?.[0]?.id;

        console.log('chatWithTwoUsers', chatWithTwoUsers[0]);
        console.log('chatWithTwoUsers id', id);

        if (id) return id;

        if (!message.chat_id && message.recipient_id) { // користувач написав новому користувачу. створити новий чат для них
            const chat = await this.chatModel.create();
            const plainChat = chat.get({ plain: true });
            await this.chatParticipantsModel.create({
                user_id: message.user_id,
                chat_id: plainChat.id
            })
            await this.chatParticipantsModel.create({
                user_id: message.recipient_id,
                chat_id: plainChat.id
            })

            return plainChat.id;
        }

        return null;
    }

    async createMessage(messageDto: CreateMessageDto) {
        if (!messageDto.chat_id) throw new HttpException('Chat is not defined', HttpStatus.BAD_REQUEST)

        if (!messageDto.text && !messageDto.files?.length) {
            throw new HttpException(
                'Message must contain either text or at least one file',
                HttpStatus.BAD_REQUEST
            );
        }

        const transaction = await this.sequelize.transaction();

        try {
            const message = await this.messagesModel.create({
                user_id: messageDto.user_id,
                chat_id: messageDto.chat_id,
                text: messageDto.text
            }, { transaction });

            if (messageDto.files?.length) {
                const filesRaws = await this.filesModel.bulkCreate(messageDto.files, { transaction });
                await message.$set('files', filesRaws, { transaction });
            }

            await transaction.commit();


            const fullMessage = await this.messagesModel.findByPk(message.id, {
                attributes: ['id', 'text', 'chat_id', 'createdAt'],
                include: [
                    { model: User, as: 'user', attributes: ['id', 'login'] },
                    { model: Chat, as: 'chat', attributes: ['title'] },
                    { model: Files, as: 'files', through: { attributes: [] }, required: false }
                ]
            });

            return fullMessage?.get({ plain: true });
        } catch (error) {
            await transaction.rollback();
            throw new HttpException('Error create message: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async updateMessage(messageDto: UpdateMessageDto) {
        const transaction = await this.sequelize.transaction();

        try {
            const message = await this.messagesModel.findByPk(messageDto.id, { transaction });
            if (!message) throw new HttpException('Message mot found', HttpStatus.NOT_FOUND);

            await this.messagesModel.update(
                { text: messageDto.text },
                {
                    where: { id: messageDto.id },
                    transaction
                },
            )

            if (messageDto.filesToDeleteIds?.length) {
                const filesRaws = await this.filesModel.findAll({ where: { id: messageDto.filesToDeleteIds }, transaction });
                await message.$remove('files', filesRaws, { transaction });
            }

            if (messageDto.files?.length) {
                const filesRaws = await this.filesModel.bulkCreate(messageDto.files, { transaction });
                await message.$set('files', filesRaws, { transaction });
            }

            await transaction.commit();


            const fullMessage = await this.messagesModel.findByPk(messageDto.id, {
                attributes: ['id', 'text', 'chat_id', 'createdAt'],
                include: [
                    { model: User, as: 'user', attributes: ['id', 'login'] },
                    { model: Chat, as: 'chat', attributes: ['title'] },
                    { model: Files, as: 'files', through: { attributes: [] }, required: false }
                ]
            });

            return fullMessage?.get({ plain: true });
        } catch (error) {
            await transaction.rollback();
            throw new HttpException('Error updating message: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateMessageByOwner(messageDto: UpdateMessageDto, userId: number) {
        if (!messageDto.id) throw new HttpException("Message id not correct", HttpStatus.BAD_REQUEST);
        const message = await this.messagesModel.findByPk(messageDto.id);
        if (!message) throw new HttpException("Message not found", HttpStatus.NOT_FOUND);
        const plainMessage = message.get({ plain: true });

        if (plainMessage.user_id !== userId) throw new HttpException('Forbidden: not your message', HttpStatus.FORBIDDEN);

        return await this.updateMessage(messageDto);
    }


    async deleteMessage(id: number) {
        const transaction = await this.sequelize.transaction();

        try {
            const message = await this.messagesModel.findByPk(id, {
                include: [{
                    model: Files,
                    as: 'files',
                    through: { attributes: [] },
                    required: false
                }],
                transaction
            });
            if (!message) {
                throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
            }

            // Отримуємо всі файли
            const plainMessage = message.get({ plain: true });
            const files = [...plainMessage.files];
            const fileIds = files.map(file => file.id);

            // Видаляємо зв’язки
            await this.messageFilesModel.destroy({
                where: { message_id: id },
                transaction
            });

            // Видаляємо файли
            if (fileIds.length > 0) {
                await this.filesModel.destroy({
                    where: { id: fileIds },
                    transaction
                });
            }

            // Видаляємо само мовідомлення
            await this.messagesModel.destroy({
                where: { id },
                transaction
            });

            // Видаляєм файли
            for (const file of files) {
                const filename = file.url.split('/').pop();
                if (filename) await this.storageService.deleteFile(filename);
            }

            await transaction.commit();
            return plainMessage;
        } catch (error) {
            console.log(error);

            await transaction.rollback();
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteMessageByOwner(id: number, userId: number) {
        const message = await this.messagesModel.findByPk(id);
        if (!message) throw new HttpException("Message not found", HttpStatus.NOT_FOUND);
        const plainMessage = message.get({ plain: true });

        if (plainMessage.user_id !== userId) throw new HttpException('Forbidden: not your message', HttpStatus.FORBIDDEN);

        return await this.deleteMessage(id);
    }
}
