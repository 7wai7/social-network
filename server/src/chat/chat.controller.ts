import { Controller, Get, HttpException, HttpStatus, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.quard";
import { ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { ReqUser } from "src/decorators/ReqUser";


@Controller("/chats")
export class ChatController {
    constructor(private readonly chatService: ChatService) { }


    @ApiOperation({
        summary: 'Отримати чати користувача',
        description: 'Повертає список всіх чатів, в яких бере участь поточний користувач, разом з інформацією про інших учасників'
    })
    @ApiResponse({
        status: 200,
        description: 'Список чатів користувача',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        example: 1,
                        description: 'ID чату'
                    },
                    title: {
                        type: 'string',
                        example: 'none',
                        description: 'Назва групи'
                    },
                    isGroup: {
                        type: 'boolean',
                        example: false,
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-15T10:30:00.000Z',
                        description: 'Дата створення чату'
                    },
                    other_user_id: {
                        type: 'number',
                        example: 2,
                        description: 'ID іншого учасника чату'
                    },
                    other_user_login: {
                        type: 'string',
                        example: 'john_doe',
                        description: 'Логін іншого учасника чату'
                    },
                    other_user_email: {
                        type: 'string',
                        example: 'john.doe@gmail.com',
                        description: 'Email іншого учасника чату'
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Користувач не авторизований',
    })
    @ApiCookieAuth('token')
    @Get()
    @UseGuards(JwtAuthGuard)
    getUserChats(@Req() req) {
        console.log("getUserChats", req.user.id);

        return this.chatService.getUserChats(req.user.id);
    }



    @ApiOperation({
        summary: 'Пошук користувачів за логіном',
        description: 'Знаходить користувачів за частковим співпадінням логіну (крім поточного користувача)'
    })
    @ApiQuery({
        name: 'login',
        description: 'Частина логіну для пошуку',
        example: 'john',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Список знайдених користувачів з котрими може існувати чат',
        example: [
            {
                user_id: 1,
                login: 'john_doe',
                chat_id: null,
                isGroup: null,
                title: null,
            },
            {
                user_id: 16,
                login: 'john_doe_2',
                chat_id: 6,
                isGroup: false,
                title: null,
            },
        ]
    })
    @ApiResponse({
        status: 401,
        description: 'Користувач не авторизований'
    })
    @ApiCookieAuth('token')
    @Get("/find")
    @UseGuards(JwtAuthGuard)
    GetUsersAndChatsByLogin(@Req() req, @Query() query) {
        console.log("GetUsersAndChatsByLogin", req.user.id);
        return this.chatService.findUsersAndChatsByLogin(req.user.id, query.login);
    }



    @ApiOperation({
        summary: 'Пошук повідомлень чату',
        description: 'Повертає повідомлення чату, підтримує cursor-based пагінацію через createdAt повідомлення'
    })
    @ApiParam({
        name: 'id',
        description: 'Id чату',
        required: true,
        type: 'string',
        example: 6
    })
    @ApiQuery({
        name: 'cursor',
        description: 'Cursor для пагінації (дата останнього повідомлення чату)',
        required: false,
        type: 'string',
        example: '2024-01-15T10:30:00.000Z',
        format: 'date-time'
    })
    @ApiResponse({
        status: 401,
        description: 'Користувач не авторизований'
    })
    @ApiCookieAuth('token')
    @Get("/:id/messages")
    @UseGuards(JwtAuthGuard)
    getChatMessages(
        @ReqUser() user,
        @Param('id') id: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: number
    ) {
        const id_ = parseInt(id);
        if (Number.isNaN(id_)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return this.chatService.getChatMessages(user.id, id_, cursor, limit); // cursor -- createdAt
    }
}