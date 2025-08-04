import { Body, Controller, Post, Res, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginUserDto, UserDto } from 'src/dto/login-user.dto';
import { RegisterUserDto } from 'src/dto/register-user.dto';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidationDto } from 'src/dto/validation-dto';

@Controller('auth')
export class AuthController {
    tokenAge: number;

    constructor(private authService: AuthService) {
        this.tokenAge = 1000 * 60 * 60 * 24;
    }


    @ApiOperation({
        summary: 'Вхід користувача в систему',
        description: 'Аутентифікація користувача за допомогою логіну/email та паролю. Повертає JWT токен у httpOnly cookie та дані користувача.'
    })
    @ApiBody({
        description: 'Дані для входу користувача',
        type: LoginUserDto
    })
    @ApiResponse({
        status: 200,
        description: 'Успішний вхід в систему',
        type: UserDto
    })
    @ApiResponse({
        status: 400,
        description: 'Помилка валідації даних',
        type: [ValidationDto]
    })
    @Post("/login")
    async login(@Body() userDto: LoginUserDto, @Res() res: Response) {
        const { token, user } = await this.authService.login(userDto);

        // Set the JWT as an HttpOnly cookie for security
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JavaScript access
            secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
            sameSite: 'lax', // Or 'strict' or 'none' depending on your needs
            maxAge: this.tokenAge // Cookie expiration in milliseconds (e.g., 1 hour)
        });

        return res.status(200).json(user);
    }


    
    @ApiOperation({
        summary: 'Реєстрація користувача в систему',
        description: 'Аутентифікація користувача за допомогою логіну/email та паролю. Повертає JWT токен у httpOnly cookie та дані користувача.'
    })
    @ApiBody({
        description: 'Дані для реєстрації користувача',
        type: RegisterUserDto
    })
    @ApiResponse({
        status: 200,
        description: 'Успішна реєстрація',
        type: UserDto
    })
    @ApiResponse({
        status: 400,
        description: 'Помилка валідації даних',
        type: [ValidationDto]
    })
    @Post("/register")
    async register(@Body() userDto: RegisterUserDto, @Res() res: Response) {
        const { token, user } = await this.authService.register(userDto);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: this.tokenAge
        });

        return res.status(200).json(user);
    }

    @ApiOperation({
        summary: 'Вихід користувача із системи',
        description: 'Видаляє JWT токен з cookies, завершуючи сесію користувача.'
    })
    @Post("/logout")
    logout(@Res() res: Response) {
        this.authService.logout(res);
    }
}
