import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatParticipants } from 'src/models/chatParticipants.model';
import { ChatMessages } from 'src/models/chatMessages.model';
import { ChatMessageFiles } from 'src/models/chatMessageFiles.model';
import { Chat } from 'src/models/chat.model';
import { ChatService } from './chat.service';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';

@Module({
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
    imports: [
        SequelizeModule.forFeature([Chat, ChatParticipants, ChatMessages, ChatMessageFiles]),
        JwtModule.register({
            secret: process.env.TOKEN_KEY || 'SECRET',
            signOptions: {
                expiresIn: '24h'
            }
        })
    ]
})
export class ChatModule { }
