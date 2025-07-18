import { IsEmail, Length, Min } from 'class-validator';

export class LoginUserDto {
    @IsEmail({}, {
        message: 'Invalid email format.'
    })
    readonly email: string;

    @Length(3, 100, {
        message: 'The password must be between 3 and 100 characters long.'
    })
    readonly password: string;
}
