import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessageDto } from 'src/dto/create-chat-message.dto';
import { ChatService } from './chat.service';
import { HttpException, HttpStatus, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { JwtSocketAuthGuard } from './jwt-socket-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@WebSocketGateway({
	cors: {
		origin: 'http://localhost:5173',
		credentials: true,
	}
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly chatService: ChatService) { }

	@WebSocketServer() server: Server;


	@UseGuards(JwtSocketAuthGuard)
	@SubscribeMessage('join-chat')
	async joinChat(
		@MessageBody() chatId: string,
		@ConnectedSocket() client: Socket
	) {
		const user = client.handshake['user'];
		console.log("join-chat user", user);
		console.log("join-chat", chatId);

		if (chatId) {
			client.join(chatId);
		}
	}

	@SubscribeMessage('leave-chat')
	async leaveChat(
		@MessageBody() chatId: string,
		@ConnectedSocket() client: Socket
	) {
		if (chatId) client.leave(chatId);
	}

	@UseGuards(JwtSocketAuthGuard)
	@SubscribeMessage('chat-message')
	async postMessage(
		@MessageBody() data: ChatMessageDto,
		@ConnectedSocket() client: Socket
	) {
		const user = client.handshake['user'];
		try {
			const newMessage = { ...data, user_id: user.id };
			const newChatId = await this.chatService.createChatIfNotExists(newMessage);
			if (newChatId) {
				newMessage.chat_id = newChatId;
			}

			const message = await this.chatService.createMessage(newMessage);

			if (!message) throw new HttpException('Error create message', HttpStatus.INTERNAL_SERVER_ERROR);

			if (newChatId) {
				client.join(String(message.chat_id)); // join не одразу додає в кімнату
				client.emit('chat-message', message); // переслати власнику для рендеру
				client.to(String(message.chat_id)).emit('chat-message', message); // переслати всім крім власника
			} else
				this.server.to(String(message.chat_id)).emit('chat-message', message); // розсилка всім
		} catch (err) {
			console.log(err);

			client.emit('chat-message-error', err);
		}
	}

	@UseGuards(JwtSocketAuthGuard)
	@SubscribeMessage('delete-message')
	async deleteMessage(
		@MessageBody() data: { id: number },
		@ConnectedSocket() client: Socket
	) {
		const user = client.handshake['user'];
		try {
			const deletedMessage = await this.chatService.deleteMessageByOwner(data.id, user.id);

			const messageData = {
				id: deletedMessage.id,
				chat_id: deletedMessage.chat_id
			}
			client.emit('delete-message', messageData);
			this.server.to(String(messageData.chat_id)).emit('delete-message', messageData);
		} catch (err) {
			console.log(err);

			client.emit('delete-message-error', {
				error: err?.message || 'Failed to delete message',
			});
		}
	}

	handleConnection(client: Socket) {
		console.log('Client connected:', client.id);
	}

	handleDisconnect(client: Socket) {
		console.log('Client disconnected:', client.id);
	}
}
