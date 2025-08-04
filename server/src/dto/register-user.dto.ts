import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

export class RegisterUserDto extends LoginUserDto {
    @Length(3, 16, {
        message: 'The login must be between 3 and 16 characters long.'
    })
    @ApiProperty({ example: 'john_doe' })
    readonly login: string;
}
