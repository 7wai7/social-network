import { Body, Controller, Post, Res, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { RegisterUserDto } from 'src/dto/register-user.dto';

@Controller('auth')
export class AuthController {
    tokenAge: number;

    constructor(private authService: AuthService) {
        this.tokenAge = 1000 * 60 * 60 * 24;
    }

    @Post("/login")
    async login(@Body() userDto: LoginUserDto, @Res() res: Response) {
        const { token } = await this.authService.login(userDto);

        // Set the JWT as an HttpOnly cookie for security
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JavaScript access
            secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
            sameSite: 'lax', // Or 'strict' or 'none' depending on your needs
            maxAge: this.tokenAge // Cookie expiration in milliseconds (e.g., 1 hour)
        });

        return res.status(200).json({ message: 'Login successful' });
    }

    @Post("/register")
    async register(@Body() userDto: RegisterUserDto, @Res() res: Response) {
        const { token } = await this.authService.register(userDto);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: this.tokenAge
        });

        return res.status(200).json({ message: 'Login successful' });
    }
}
