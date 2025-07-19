import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { InjectModel } from '@nestjs/sequelize';
import { PostFile } from 'src/models/postFile.model';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from 'src/users/users.service';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';

@Controller('/posts')
export class PostsController {
    constructor(
        private readonly usersService: UsersService,
        private readonly postsService: PostsService,
        @InjectModel(PostFile) private postFilesModel: typeof PostFile
    ) { }


    @Get("/user/:login")
    async getUserPosts(@Param('login') login: string) {
        const user = await this.usersService.getUserByLogin(login);
        if(!user) {
            throw new HttpExceptionCode([{
                message: "User not found",
                code: "LOGIN_INVALID"
            }], HttpStatus.BAD_REQUEST);
        }

        const plainUser = user.get({ plain: true });
        return await this.postsService.getUserPosts(plainUser.id);
    }


    @UseGuards(JwtAuthGuard)
    @Get('/news/feed')
    async getNewsFeed(@Req() req) {
        return await this.postsService.getNewsFeed(req.user.id);
    }


    @Get("/file/:id")
    async getPostFile(@Param('id') id: string, @Res() res: Response) {
        const post_file_id = parseInt(id);
        if (Number.isNaN(post_file_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

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

    @Delete("/:id")
    @UseGuards(JwtAuthGuard)
    deletePost(@Req() req, @Param('id') id: string) {
        const id_ = parseInt(id);
        if (Number.isNaN(id_)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return this.postsService.deletePostByOwner(id_, req.user.id);
    }
}
