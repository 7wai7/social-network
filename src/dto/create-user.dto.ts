import { IsEmail, Length } from "sequelize-typescript";

export class CreateUserDto {
    readonly login: string;
    readonly email: string;
    readonly password: string;
}