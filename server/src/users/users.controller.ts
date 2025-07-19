import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/users.model';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        @InjectModel(User) private userModel: typeof User
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get("/me")
    getMe(@Req() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get("/check-auth")
    checkAuthorised() {
        return true;
    }

    @Get("/profile/:login")
    getUserProfile(@Param('login') login: string) {
        return this.userService.getUserProfileByLogin(login);
    }

    @Get(":id/followers")
    async getFollowers(@Param('id') id: string) {
        const f_id = parseInt(id);
        if (Number.isNaN(f_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return await this.userService.getFollowers(f_id);
    }

    @Get(":id/following")
    async getFollowing(@Param('id') id: string) {
        const f_id = parseInt(id);
        if (Number.isNaN(f_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);
        return await this.userService.getFollowing(f_id);
    }

    @UseGuards(JwtAuthGuard)
    @Post("follow/:id")
    async followUser(@Param('id') id: string, @Req() req) {
        const following_id = parseInt(id);
        if (Number.isNaN(following_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        return this.userService.followUser(req.user.id, following_id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("follow/:id")
    async unfollowUser(@Param('id') id: string, @Req() req) {
        const following_id = parseInt(id);
        if (Number.isNaN(following_id)) throw new HttpException('Not correct id', HttpStatus.BAD_REQUEST);

        return this.userService.unfollowUser(req.user.id, following_id);
    }
}
