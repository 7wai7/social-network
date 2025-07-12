import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from 'src/dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    
    @Get("/post/:id")
    async getCommentsByPostId(@Param('id') id: string) {
        const post_id = parseInt(id);
        if (Number.isNaN(post_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        return await this.commentsService.getCommentsByPostId(post_id);
    }


    @Post("/post/:id")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async createComment(
        @Req() req,
        @Param('id') id: string,
        @Body() body: { text: string },
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        const post_id = parseInt(id);
        if (Number.isNaN(post_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        this.commentsService.createComment({
            user_id: req.user.id,
            post_id,
            text: body.text
        }, files)
    }
}
