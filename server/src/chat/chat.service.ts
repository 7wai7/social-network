import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ChatMessageDto } from 'src/dto/create-chat-message.dto';
import { Chat } from 'src/models/chat.model';
import { ChatMessageFiles } from 'src/models/chatMessageFiles.model';
import { ChatMessages } from 'src/models/chatMessages.model';
import { ChatParticipants } from 'src/models/chatParticipants.model';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat) private chatModel: typeof Chat,
        @InjectModel(ChatParticipants) private chatParticipantsModel: typeof ChatParticipants,
        @InjectModel(ChatMessages) private chatMessagesModel: typeof ChatMessages,
        @InjectModel(ChatMessageFiles) private chatMessageFilesModel: typeof ChatMessageFiles
    ) { }


    async getChatMessages(id: number) {
        return await this.chatMessagesModel.findAll({
            where: {
                chat_id: id
            },
            include: {
                model: ChatMessageFiles,
                as: 'files'
            }
        })
    }

    async createMessage(message: ChatMessageDto, files: any = []) {
        console.log(message);

        if (!message.text && files.length === 0) {
            throw new HttpException(
                'Message must contain either text or at least one file',
                HttpStatus.BAD_REQUEST
            );
        }

        let chatId = message.chat_id;

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

            chatId = plainChat.id;
        }

        if (chatId) {
            const newMessage = await this.chatMessagesModel.create({ ...message, chat_id: chatId })
            const plainMessage = newMessage.get({ plain: true });
            const filesDir = path.join(__dirname, '..', '..', 'data', 'chats messages', `chat_${chatId}`, `message_${plainMessage.id}`);

            try {
                if (files.length > 0) {
                    if (files.length > 10 || files.some(f => f.data.length > 5_000_000)) {
                        throw new HttpException('Too many or too big files', HttpStatus.BAD_REQUEST);
                    }

                    fs.mkdirSync(filesDir, { recursive: true });

                    for (const file of files) {
                        const ext = path.extname(file.originalname);
                        const base = path.basename(file.originalname, ext);
                        const filename = `${base}_${Date.now()}${ext}`;

                        await this.chatMessageFilesModel.create({
                            message_id: plainMessage.id,
                            filename,
                            mimetype: file.mimetype
                        });

                        const targetPath = path.join(filesDir, filename);
                        fs.writeFileSync(targetPath, file.buffer);
                    }
                }

                return plainMessage;
            } catch (error) {
                console.log(error);

                await this.chatMessageFilesModel.destroy({
                    where: {
                        message_id: plainMessage.id
                    }
                })
                await newMessage.destroy();

                // Видаляємо папку з файлами, якщо вона створилася
                if (fs.existsSync(filesDir)) {
                    fs.rmSync(filesDir, { recursive: true, force: true });
                }

                throw new HttpException("Uploading error", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        throw new HttpException("Server error", HttpStatus.INTERNAL_SERVER_ERROR);
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
