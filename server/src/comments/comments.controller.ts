import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from 'src/dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/sequelize';
import { CommentFile } from 'src/models/commentFiles.model';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        @InjectModel(CommentFile) private commentFileModel: typeof CommentFile,
    ) {}

    
    @Get("/post/:id")
    async getCommentsByPostId(@Param('id') id: string) {
        const post_id = parseInt(id);
        if (Number.isNaN(post_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        return await this.commentsService.getCommentsByPostId(post_id);
    }
    
    @Get("file/:id")
    async getPostFile(@Param('id') id: string, @Res() res: Response) {
        const comment_file_id = parseInt(id);
        if(Number.isNaN(comment_file_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        
        const postFile = await this.commentFileModel.findByPk(comment_file_id);
        if (!postFile) {
            throw new HttpException('Row not found', HttpStatus.NOT_FOUND);
        }

        const plainPostFile = postFile.get({ plain: true });

        const pathFile = path.join(
            __dirname,
            '..',
            '..',
            'data',
            'comments',
            `comment_${plainPostFile.comment_id}`,
            plainPostFile.filename
        );

        if (!fs.existsSync(pathFile)) {
            throw new HttpException('File not found on disk', HttpStatus.NOT_FOUND);
        }

        res.setHeader('Content-Type', plainPostFile.mimetype);
        return res.sendFile(pathFile);
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

        return this.commentsService.createComment({
            user_id: req.user.id,
            post_id,
            text: body.text
        }, files)
    }


    @Delete('/:id')
    deleteComment(@Param('id') id: string,) {
        const id_ = parseInt(id);
        if (Number.isNaN(id_)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        this.commentsService.deleteComment(id_);
    }
}
