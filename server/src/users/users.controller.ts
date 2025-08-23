import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/users.model';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserDto } from 'src/dto/login-user.dto';
import { UserProfileDto } from 'src/dto/user-profile.dto';
import { ReqUser } from 'src/decorators/ReqUser';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        @InjectModel(User) private userModel: typeof User
    ) { }


    @ApiOperation({
        summary: 'Отримати дані поточного користувача',
        description: 'Повертає інформацію про авторизованого користувача'
    })
    @ApiResponse({
        status: 200,
        description: 'Дані користувача успішно отримані',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                login: { type: 'string', example: 'john_doe' },
                email: { type: 'string', example: 'john.doe@gmail.com' },
            }
        }
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
    @Get("/me")
    getMe(@Req() req) {
        return req.user;
    }



    @ApiOperation({ 
        summary: 'Перевірити статус авторизації',
        description: 'Перевіряє чи користувач авторизований та повертає true якщо так'
    })
    @ApiResponse({
        status: 200,
        description: 'Користувач авторизований',
        schema: {
            type: 'boolean',
            example: true
        }
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
    @ApiOperation({ summary: 'Перевірити авторизованість користувача' })
    @ApiResponse({ status: 200, type: Boolean })
    @UseGuards(JwtAuthGuard)
    @Get("/check-auth")
    checkAuthorised() {
        return true;
    }



    @ApiOperation({ 
        summary: 'Пошук користувачів за логіном',
        description: 'Знаходить користувачів за частковим співпадінням логіну (крім поточного користувача)'
    })
    @ApiParam({
        name: 'login',
        description: 'Частина логіну для пошуку',
        example: 'john',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Список знайдених користувачів',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    login: { type: 'string', example: 'john_doe' },
                    email: { type: 'string', example: 'john@gmail.com' }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Користувач не авторизований'
    })
    @ApiCookieAuth('token')
    @UseGuards(JwtAuthGuard)
    @Get("/find/:login")
    findUsers(
        @ReqUser() user,
        @Param('login') login: string,
        @Query('limit') limit: number
    ) {
        return this.userService.findUsersByLogin(user.id, login, limit);
    }




    @ApiOperation({ 
        summary: 'Пошук профіля користувача за логіном'
    })
    @ApiParam({
        name: 'login',
        description: 'Логін для пошуку',
        example: 'john_doe',
        type: 'string'
    })
    @ApiResponse({
        type: UserProfileDto
    })
    @ApiCookieAuth('token')
    @UseGuards(JwtAuthGuard)
    @Get("/profile/:login")
    async getUserProfile(@Param('login') login: string, @Req() req) {
        return await this.userService.getUserProfileByLogin(login, req.user.id);
    }



    

    @ApiOperation({ 
        summary: 'Пошук підписників користувача'
    })
    @ApiParam({
        name: 'id',
        example: '16',
        type: 'number'
    })
    @ApiResponse({
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    login: { type: 'string', example: 'john_doe' }
                }
            }
        }
    })
    @Get(":id/followers")
    async getFollowers(@Param('id') id: string) {
        const f_id = parseInt(id);
        if (Number.isNaN(f_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return await this.userService.getFollowers(f_id);
    }


    @ApiOperation({ 
        summary: 'Пошук тих, на кого користувач підписався'
    })
    @ApiParam({
        name: 'id',
        example: '16',
        type: 'number'
    })
    @ApiResponse({
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    login: { type: 'string', example: 'john_doe' }
                }
            }
        }
    })
    @Get(":id/following")
    async getFollowing(@Param('id') id: string) {
        const f_id = parseInt(id);
        if (Number.isNaN(f_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return await this.userService.getFollowing(f_id);
    }



    
    @ApiOperation({ 
        summary: 'Підписатися на користувача',
        description: 'Створює підписку поточного користувача на вказаного користувача'
    })
    @ApiParam({
        name: 'id',
        description: 'ID користувача, на якого потрібно підписатися',
        example: 1,
        type: 'number'
    })
    @ApiResponse({
        status: 200,
        description: 'Успішно підписалися',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolesan', example: 'true' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Некоректний ID або спроба підписатися на себе'
    })
    @ApiResponse({
        status: 401,
        description: 'Користувач не авторизований'
    })
    @ApiResponse({
        status: 404,
        description: 'Користувача для підписки не знайдено'
    })
    @ApiResponse({
        status: 409,
        description: 'Ви вже підписані на цього користувача'
    })
    @ApiResponse({
        status: 500,
        description: 'Server error'
    })
    @ApiCookieAuth('token')
    @UseGuards(JwtAuthGuard)
    @Post("follow/:id")
    async followUser(@Param('id') id: string, @Req() req) {
        const following_id = parseInt(id);
        if (Number.isNaN(following_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        return this.userService.followUser(req.user.id, following_id);
    }




    
    @ApiOperation({ 
        summary: 'Відписатися від користувача',
        description: 'Видаляє підписку поточного користувача і вказаного користувача'
    })
    @ApiParam({
        name: 'id',
        description: 'ID користувача, від котрого потрібно відписатися',
        example: 1,
        type: 'number'
    })
    @ApiResponse({
        status: 200,
        description: 'Успішно відписалися',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolesan', example: 'true' }
            }
        }
    })
    @ApiCookieAuth('token')
    @UseGuards(JwtAuthGuard)
    @Delete("follow/:id")
    async unfollowUser(@Param('id') id: string, @Req() req) {
        const following_id = parseInt(id);
        if (Number.isNaN(following_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        return this.userService.unfollowUser(req.user.id, following_id);
    }
}
