import { Controller, Get, HttpException, HttpStatus, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.quard";


@Controller("/chats")
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    getUserChats(@Req() req) {
        console.log("getUserChats", req.user.id);
        
        return this.chatService.getUserChats(req.user.id);
    }
    
    @Get("/find")
    @UseGuards(JwtAuthGuard)
    GetUsersAndChatsByLogin(@Req() req, @Query() query) {
        console.log("GetUsersAndChatsByLogin", req.user.id);
        return this.chatService.findUsersAndChatsByLogin(req.user.id, query.login);
    }

    @Get("/:id/messages")
    getChatMessages(@Param('id') id: string, @Query() query) {
        const id_ = parseInt(id);
        if (Number.isNaN(id_)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        const cursor = query.before; // cursor -- createdAt
        return this.chatService.getChatMessages(id_, cursor);
    }
}