import { IsEmail, Length } from 'class-validator';

export class RegisterUserDto {
    @Length(3, 16, {
        message: 'The login must be between 3 and 16 characters long.'
    })
    readonly login: string;

    @IsEmail({}, {
        message: 'Invalid email format.'
    })
    readonly email: string;
    
    @Length(3, 100, {
        message: 'The password must be between 3 and 100 characters long.'
    })
    readonly password: string;
}
