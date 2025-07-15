import { Controller, Get, HttpException, HttpStatus, Param } from "@nestjs/common";
import { ChatService } from "./chat.service";


@Controller("/chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get("/:id")
    async getChatMessages(@Param('id') id: string) {
        const id_ = parseInt(id);
        if (Number.isNaN(id_)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return await this.chatService.getChatMessages(id_);
    }
}