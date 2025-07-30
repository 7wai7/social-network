import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatParticipants } from 'src/models/chatParticipants.model';
import { Chat } from 'src/models/chat.model';
import { ChatService } from './chat.service';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { Files } from 'src/models/files.model';
import { Messages } from 'src/models/messages.model';
import { MessageFiles } from 'src/models/messageFiles.model';
import { StorageModule } from 'src/storage/storage.module';

@Module({
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
    imports: [
        SequelizeModule.forFeature([Chat, ChatParticipants, Messages, MessageFiles, Files]),
        JwtModule.register({
            secret: process.env.TOKEN_KEY || 'SECRET',
            signOptions: {
                expiresIn: '24h'
            }
        }),
        StorageModule
    ]
})
export class ChatModule { }
