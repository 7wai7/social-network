import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { UsersService } from 'src/users/users.service';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/users.model';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { CreatePostDto, PostDto } from 'src/dto/create-post.dto';
import { PostsCreationAttrs } from 'src/models/posts.model';
import { CreateFileDto } from 'src/dto/create-file.dto';

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




    @ApiOperation({
        summary: 'Завантаження новин для користувача',
        description: 'Повертає стрічку новин з постами користувачів, на яких підписаний поточний користувач. Підтримує пагінацію через cursor-based pagination.'
    })
    @ApiQuery({
        name: 'cursor',
        description: 'Cursor для пагінації (дата створення останнього поста з попередньої сторінки)',
        required: false,
        type: 'string',
        example: '2024-01-15T10:30:00.000Z',
        format: 'date-time'
    })
    @ApiResponse({
        status: 200,
        description: 'Стрічка новин успішно завантажена',
        type: [PostDto]
    })
    @ApiResponse({
        status: 401,
        description: 'Користувач не авторизований',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' }
            }
        }
    })
    @ApiCookieAuth('token')
    @UseGuards(JwtAuthGuard)
    @Get('/news/feed')
    async getNewsFeed(@Req() req, @Query('cursor') cursor?: string) {
        return await this.postsService.getNewsFeed(req.user.id, cursor);
    }





    @ApiOperation({
        summary: 'Створення поста',
        description: 'Створює новий пост з текстом та файлами (зображеннями, відео тощо)'
    })
    @ApiBody({
        description: 'Дані для створення поста',
        type: CreatePostDto
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
        @Body() body: { text: string, files?: CreateFileDto[]}
    ) {
        return await this.postsService.createPost({
            ...body,
            user_id: req.user.id,
        })
    }



    @ApiOperation({
        summary: 'Видалення поста',
        description: 'Видаляє пост по ip'
    })
    @ApiParam({
        name: 'id',
        example: 10,
        type: 'string'
    })
    @ApiResponse({
        status: 204,
        example: true
    })
    @ApiResponse({
        status: 400,
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Not correct id' }
            }
        }
    })
    @ApiResponse({
        status: 403,
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Forbidden: not your message' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Post not found' }
            }
        }
    })
    @ApiResponse({
        status: 500,
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Server error' }
            }
        }
    })
    @ApiCookieAuth('token')
    @Delete("/:id")
    @UseGuards(JwtAuthGuard)
    deletePost(@Req() req, @Param('id') id: string) {
        const id_ = parseInt(id);
        console.log("delete post", id_);

        if (Number.isNaN(id_)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return this.postsService.deletePostByOwner(id_, req.user.id);
    }
}
