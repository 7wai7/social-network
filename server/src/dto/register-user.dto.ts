import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

export class RegisterUserDto extends LoginUserDto {
    @IsEmail({}, {
        message: 'Invalid email format.'
    })
    @ApiProperty({ example: 'john.doe@gmail.com' })
    readonly email: string;
}
