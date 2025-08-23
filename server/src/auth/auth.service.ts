import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/models/users.model';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { RegisterUserDto } from 'src/dto/register-user.dto';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(userDto: LoginUserDto) {
        const user = await this.userService.getUserByLogin(userDto.login);
        if (!user) {
            throw new HttpExceptionCode([
                {
                    field: 'login',
                    message: "A user does not exists.",
                    code: "LOGIN_INVALID"
                }
            ], HttpStatus.BAD_REQUEST);
        }

        const plainUser = user.get({ plain: true });
        const result = await bcrypt.compare(userDto.password, plainUser.password);

        if (!result) {
            throw new HttpExceptionCode([
                {
                    field: 'password',
                    message: "A password is not correct.",
                    code: "PASSWORD_INVALID"
                }
            ], HttpStatus.BAD_REQUEST);
        }

        return this.generateToken(plainUser);
    }

    async register(userDto: RegisterUserDto) {
        const existedLogin = await this.userService.getUserByLogin(userDto.login);
        if (existedLogin) {
            throw new HttpExceptionCode([
                {
                    field: 'login',
                    message: "A user with this login exists.",
                    code: "LOGIN_INVALID"
                }
            ], HttpStatus.BAD_REQUEST);
        }

        const existedEmail = await this.userService.getUserByEmail(userDto.email);
        if (existedEmail) {
            throw new HttpExceptionCode([
                {
                    field: "email",
                    message: "A user with this email address exists.",
                    code: "EMAIL_INVALID"
                }
            ], HttpStatus.BAD_REQUEST);
        }

        const hash = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.create({ ...userDto, password: hash });
        return this.generateToken(user.get({ plain: true }));
    }
    
    logout(res: Response) {
        res.clearCookie('token');
        res.end();
    }

    generateToken(user: User) {
        const userData = { id: user.id, email: user.email, login: user.login };
        return {
            token: this.jwtService.sign(userData),
            user: userData
        };
    }
}
