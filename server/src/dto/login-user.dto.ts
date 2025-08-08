import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Min } from 'class-validator';

export class LoginUserDto {
    @IsEmail({}, {
        message: 'Invalid email format.'
    })
    @ApiProperty({ example: 'john.doe@gmail.com' })
    readonly email: string;

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
