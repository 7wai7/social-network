import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Min } from 'class-validator';

export class LoginUserDto {
    @Length(3, 16, {
        message: 'The login must be between 3 and 16 characters long.'
    })
    @ApiProperty({ example: 'john_doe' })
    readonly login: string;

    @Length(3, 100, {
        message: 'The password must be between 3 and 100 characters long.'
    })
    @ApiProperty({ example: 'SecurePassword123!' })
    readonly password: string;
}


export class UserDto {
    @ApiProperty({ example: 1 })
    readonly id: number;

    @ApiProperty({ example: 'john_doe' })
    readonly login: string;

    @ApiProperty({ example: 'john.doe@gmail.com' })
    readonly email?: string;

    @ApiProperty({ example: 'SecurePassword123!' })
    readonly password?: string;
}
