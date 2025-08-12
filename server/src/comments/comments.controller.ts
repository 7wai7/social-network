import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto, CreateCommentDto } from 'src/dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReqUser } from 'src/decorators/ReqUser';
import { CreateFileDto } from 'src/dto/create-file.dto';

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
    ) {}

    
    @Get("/post/:id")
    @UseGuards(JwtAuthGuard)
    getCommentsByPostId(
        @ReqUser() user,
        @Param('id') id: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limit?: number
    ) {
        
        const post_id = parseInt(id);
        if (Number.isNaN(post_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return this.commentsService.getCommentsByPostId(user.id, post_id, cursor, limit);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async createComment(
        @ReqUser() user,
        @Body() body: { post_id: number, text: string, files?: CreateFileDto[]},
    ) {
        return this.commentsService.createComment({
            ...body,
            user_id: user.id
        })
    }


    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    deleteComment(@ReqUser() user, @Param('id') id: string) {
        const id_ = parseInt(id);
        if (Number.isNaN(id_)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        this.commentsService.deleteCommentByOwner(user.id, id_);
    }
}
