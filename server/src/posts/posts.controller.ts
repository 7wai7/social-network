import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { InjectModel } from '@nestjs/sequelize';
import { PostFile } from 'src/models/postFile.model';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('/posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        @InjectModel(PostFile) private postFilesModel: typeof PostFile
    ) { }


    @Get("/:id")
    async getUserPosts(@Param('id') id: string) {
        const user_id = parseInt(id);
        if (Number.isNaN(user_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        return await this.postsService.getUserPosts(user_id);
    }


    @UseGuards(JwtAuthGuard)
    @Get('/news')
    async getNewsFeed(@Req() req) {
        return await this.postsService.getNewsFeed(req.user.id);
    }


    @Get("/file/:id")
    async getPostFile(@Param('id') id: string, @Res() res: Response) {
        const post_file_id = parseInt(id);
        if(Number.isNaN(post_file_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        
        const postFile = await this.postFilesModel.findByPk(post_file_id);
        if (!postFile) {
            throw new HttpException('Row not found', HttpStatus.NOT_FOUND);
        }

        const plainPostFile = postFile.get({ plain: true });

        const pathFile = path.join(
            __dirname,
            '..',
            '..',
            'data',
            'posts',
            `post_${plainPostFile.post_id}`,
            plainPostFile.filename
        );

        if (!fs.existsSync(pathFile)) {
            throw new HttpException('File not found on disk', HttpStatus.NOT_FOUND);
        }

        res.setHeader('Content-Type', plainPostFile.mimetype);
        return res.sendFile(pathFile);
    }


    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    createPost(
        @Req() req,
        @Body() body: { text: string },
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        return this.postsService.createPost({
            user_id: req.user.id,
            text: body.text
        }, files)
    }
}
