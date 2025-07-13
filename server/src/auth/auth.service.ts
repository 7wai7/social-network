import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/models/users.model';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async login(userDto: CreateUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email);
        if(!user) {
            throw new HttpException("A user does not exists.", HttpStatus.BAD_REQUEST);
        }

        const plainUser = user.get({ plain: true });
        const result = await bcrypt.compare(userDto.password, plainUser.password);
        
        if(!result) {
            throw new HttpException("A password is not correct", HttpStatus.BAD_REQUEST);
        }

        return this.generateToken(plainUser);
    }

    async register(userDto: CreateUserDto) {
        const existedUser = await this.userService.getUserByEmail(userDto.email);
        if(existedUser) {
            throw new HttpException("A user with this email address exists.", HttpStatus.BAD_REQUEST);
        }

        const hash = await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.create({...userDto, password: hash});
        return this.generateToken(user);
    }

    generateToken(user: User) {
        return {
            token: this.jwtService.sign({id: user.id, email: user.email})
        };
    }
}
