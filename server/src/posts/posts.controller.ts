import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { UsersService } from 'src/users/users.service';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { FileDto } from 'src/dto/create-file.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/users.model';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PostDto } from 'src/dto/create-post.dto';

@Controller('/posts')
export class PostsController {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private readonly postsService: PostsService,
    ) { }

    @ApiOperation({
        summary: 'Отримати пости користувача за логіном',
        description: 'Повертає список постів вказаного користувача'
    })
    @ApiParam({
        name: 'login',
        description: 'Логін користувача',
        example: 'john_doe',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Список постів користувача',
        type: [PostDto]
    })
    @ApiResponse({
        status: 400,
        description: 'Користувача не знайдено',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: 'User not found' },
                code: { type: 'string', example: 'LOGIN_INVALID' }
            }
        }
    })
    @Get("/user/:login")
    async getUserPosts(@Param('login') login: string) {
        const user = await this.userModel.findOne({ where: { login } });
        if (!user) {
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





    @ApiOperation({
        summary: 'Створення поста',
        description: 'Створює новий пост з текстом та файлами (зображеннями, відео тощо)'
    })
    @ApiBody({
        description: 'Дані для створення поста',
        schema: {
            type: 'object',
            properties: {
                text: {
                    type: 'string',
                    example: 'Перший пост'
                },
                files: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            originalname: { type: 'string', example: 'picture.png' },
                            mimetype: { type: 'string', example: 'image/png' },
                            url: { type: 'string', example: 'https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png' },
                        }
                    },
                    description: 'Масив файлів для поста'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Пост успішно створено',
        type: PostDto
    })
    @ApiCookieAuth('token')
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
