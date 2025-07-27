import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ChatMessageDto } from 'src/dto/create-chat-message.dto';
import { Chat } from 'src/models/chat.model';
import { ChatMessageFiles } from 'src/models/chatMessageFiles.model';
import { ChatMessages } from 'src/models/chatMessages.model';
import { ChatParticipants } from 'src/models/chatParticipants.model';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { User } from 'src/models/users.model';
import { Op, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat) private chatModel: typeof Chat,
        @InjectModel(ChatParticipants) private chatParticipantsModel: typeof ChatParticipants,
        @InjectModel(ChatMessages) private chatMessagesModel: typeof ChatMessages,
        @InjectModel(ChatMessageFiles) private chatMessageFilesModel: typeof ChatMessageFiles,
        @Inject(Sequelize) private readonly sequelize: Sequelize,
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
        chatId: number,
        cursor?: string
    ): Promise<ChatMessages[]> {
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
                model: ChatMessageFiles,
                as: 'files'
            }
        ];

        const messages = await this.chatMessagesModel.findAll({
            where,
            include,
            order: [['createdAt', 'DESC']],
            limit: 30,
            attributes: ['id', 'text', 'createdAt']
        });

        // console.log(messages);
        return messages;
    }


    async createChatIfNotExists(message: ChatMessageDto) {
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

    async createMessage(message: ChatMessageDto, files: any = []) {
        console.log("message", message);

        if (!message.chat_id) throw new HttpException('Chat is not defined', HttpStatus.BAD_REQUEST)

        if (!message.text && files.length === 0) {
            throw new HttpException(
                'Message must contain either text or at least one file',
                HttpStatus.BAD_REQUEST
            );
        }

        const newMessage = await this.chatMessagesModel.create(message)
        const plainMessage = newMessage.get({ plain: true });
        const fullMessage = await this.chatMessagesModel.findByPk(plainMessage.id, {
            attributes: ['id', 'text', 'createdAt'],
            include: [
                { model: User, as: 'user', attributes: ['id', 'login'] },
                { model: Chat, as: 'chat', attributes: ['title'] }
            ]
        });

        const plainFullMessage = fullMessage?.get({ plain: true });
        if (!plainFullMessage) return plainMessage;

        console.log("fullMessage", plainFullMessage);



        // const filesDir = path.join(process.cwd(), 'data', 'chats messages', `chat_${message.chat_id}`, `message_${plainMessage.id}`);

        // if (files.length > 10 || files.some(f => f.size > 10_000_000_000_000)) {
        //     throw new HttpException('Too many or too big files', HttpStatus.BAD_REQUEST);
        // }

        try {
            // if (files.length > 0) {
            //     fs.mkdirSync(filesDir, { recursive: true });

            //     for (const file of files) {
            //         const ext = path.extname(file.originalname);
            //         // const base = path.basename(file.originalname, ext);
            //         const filename = `${randomUUID()}${ext}`;

            //         await this.chatMessageFilesModel.create({
            //             message_id: plainMessage.id,
            //             filename,
            //             mimetype: file.mimetype
            //         });

            //         const targetPath = path.join(filesDir, filename);
            //         fs.writeFileSync(targetPath, file.buffer);
            //     }
            // }

            return plainFullMessage;
        } catch (error) {
            console.log(error);

            await this.chatMessageFilesModel.destroy({
                where: {
                    message_id: plainMessage.id
                }
            })
            await newMessage.destroy();

            // Видаляємо папку з файлами, якщо вона створилася
            // if (fs.existsSync(filesDir)) {
            //     fs.rmSync(filesDir, { recursive: true, force: true });
            // }

            throw new HttpException("Uploading error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async deleteMessageByOwner(id: number, userId: number) {
        const message = await this.chatMessagesModel.findOne({ where: { id } });
        if (!message) throw new HttpException("Message not found", HttpStatus.NOT_FOUND);
        if (message.user_id !== userId) throw new HttpException('Forbidden: not your message', HttpStatus.FORBIDDEN);

        const plainMessage = message.get({ plain: true });
        const filesDir = path.join(__dirname, '..', '..', 'data', 'chats messages', `chat_${plainMessage.chat_id}`, `message_${plainMessage.id}`);

        await Promise.all([
            message.destroy(),
            this.chatMessageFilesModel.destroy({ where: { message_id: id } }),
        ]);

        if (fs.existsSync(filesDir)) {
            fs.rmSync(filesDir, { recursive: true, force: true });
        }

        return true;
    }
}
