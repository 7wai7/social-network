import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post("/login")
    async login(@Body() userDto: CreateUserDto) {
        return await this.authService.login(userDto);
    }

    @Post("/register")
    async register(@Body() userDto: CreateUserDto) {
        return await this.authService.register(userDto);
    }
}
