import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateMessageDto, MessageDto } from 'src/dto/create-message.dto';
import { UpdateMessageDto } from 'src/dto/update-message.dto';

@ApiTags('WebSocket Docs')
@Controller('ws-docs')
export class WebSocketDocsController {
    
    @ApiOperation({
        summary: 'Приєднатися до чату',
        description: 'Приєднує користувача до вказаного чату для отримання повідомлень в реальному часі'
    })
    @ApiBody({
        description: 'ID чату для приєднання',
        schema: {
            type: 'string',
            example: '123'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Успішно приєднався до чату',
        schema: {
            type: 'object',
            properties: {
                event: { type: 'string', example: 'join-chat' },
                status: { type: 'string', example: 'success' }
            }
        }
    })
    @Post('/join-chat')
    async joinChat() { }


    @ApiOperation({
        summary: 'Покинути чат',
        description: 'Відключає користувача від вказаного чату'
    })
    @ApiBody({
        description: 'ID чату для виходу',
        schema: {
            type: 'string',
            example: '123'
        }
    })
    @Post('/leave-chat')
    async leaveChat() { }



    @ApiOperation({
        summary: 'Відправити повідомлення в чат',
        description: 'Відправляє нове повідомлення в чат та розсилає його всім учасникам'
    })
    @ApiBody({
        type: CreateMessageDto,
        description: 'Дані повідомлення для відправки'
    })
    @ApiResponse({
        status: 200,
        description: 'Повідомлення успішно відправлено',
        type: MessageDto
    })
    @ApiResponse({
        status: 400,
        description: 'Помилка при створенні повідомлення',
        schema: {
            type: 'object',
            properties: {
                event: { type: 'string', example: 'chat-message-error' },
                error: { type: 'string', example: 'Error create message' }
            }
        }
    })
    @Post('/chat-message')
    async postMessage() { }



    @ApiOperation({
        summary: 'Оновити повідомлення',
        description: 'Дозволяє власнику повідомлення редагувати його текст'
    })
    @ApiBody({
        type: UpdateMessageDto,
        description: 'Оновлені дані повідомлення'
    })
    @ApiResponse({
        status: 200,
        description: 'Повідомлення успішно оновлено',
        type: MessageDto
    })
    @Post('update-message')
    async updateMessage() { }




    @ApiOperation({
        summary: 'Видалити повідомлення',
        description: 'Дозволяє власнику повідомлення видалити його з чату'
    })
    @ApiBody({
        description: 'ID повідомлення для видалення',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 }
            },
            required: ['id']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Повідомлення успішно видалено',
        schema: {
            type: 'object',
            properties: {
                event: { type: 'string', example: 'delete-message' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        chat_id: { type: 'number', example: 123 }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden: not your message'
    })
    @ApiResponse({
        status: 404,
        description: 'Message not found'
    })
    @Delete('delete-message')
    async deleteMessage() {}
}
