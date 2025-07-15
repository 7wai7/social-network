import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessageDto } from 'src/dto/create-chat-message.dto';
import { ChatService } from './chat.service';
import { UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { JwtSocketAuthGuard } from './jwt-socket-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly chatService: ChatService) { }

	@WebSocketServer() server: Server;


	@UseGuards(JwtSocketAuthGuard)
	@SubscribeMessage('join-chat')
	async joinChat(
		@MessageBody() data: { chatId: string },
		@ConnectedSocket() client: Socket
	) {
		client.join(data.chatId);
	}

	@SubscribeMessage('leave-chat')
	async leaveChat(
		@MessageBody() data: { chatId: string },
		@ConnectedSocket() client: Socket
	) {
		client.leave(data.chatId);
	}

	@UseGuards(JwtSocketAuthGuard)
	@SubscribeMessage('chat-message')
	async postMessage(
		@MessageBody() data: ChatMessageDto,
		@ConnectedSocket() client: Socket
	) {
		const user = client.handshake['user'];
		console.log(data.files);

		const files = data.files || [];
		try {
			// const message = await this.chatService.createMessage({ ...data, user_id: user.id }, files);
			// this.server.to(String(message.chat_id)).emit('chat-message', message); // розсилка всім
		} catch (err) {
			client.emit('chat-message-error', {
				error: err?.message || 'Failed to send message',
			});
		}
	}

	@UseGuards(JwtSocketAuthGuard)
	@SubscribeMessage('delete-message')
	async deleteMessage(
		@MessageBody() data: { id: number, chatId: string },
		@ConnectedSocket() client: Socket
	) {
		const user = client.handshake['user'];
		try {
			await this.chatService.deleteMessageByOwner(data.id, user.id);
			this.server.to(String(data.chatId)).emit('message-deleted', { id: data.id });
		} catch (err) {
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
