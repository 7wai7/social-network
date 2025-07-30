import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from 'src/users/users.service';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { FileDto } from 'src/dto/create-file.dto';

@Controller('/posts')
export class PostsController {
    constructor(
        private readonly usersService: UsersService,
        private readonly postsService: PostsService,
        // @InjectModel(PostFile) private postFilesModel: typeof PostFile
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

    @Post()
    @UseGuards(JwtAuthGuard)
    async createPost(
        @Req() req,
        @Body() body: { text: string, files: FileDto[] }
    ) {
        return await this.postsService.createPost({
            user_id: req.user.id,
            ...body
        })
    }

    @Delete("/:id")
    @UseGuards(JwtAuthGuard)
    deletePost(@Req() req, @Param('id') id: string) {
        const id_ = parseInt(id);
        console.log("delete post", id_);
        
        if (Number.isNaN(id_)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return this.postsService.deletePostByOwner(id_, req.user.id);
    }
}
