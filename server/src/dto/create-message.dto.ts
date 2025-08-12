import { ApiProperty } from "@nestjs/swagger";
import { FileDto } from "./create-file.dto";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserDto } from "./login-user.dto";


export class CreateMessageDto {
    @ApiProperty({ example: 1, description: 'ID власника повідомлення' })
    readonly user_id: number;

    @ApiProperty({ example: 2, description: 'ID отримувача повідомлення' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    readonly recipient_id?: number;

    @ApiProperty({ example: 6, description: 'ID чату повідомлення' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    readonly chat_id?: number;

    @ApiProperty({ example: 'Повідомлення', description: 'Текст повідомлення' })
    @IsOptional()
    @IsString()
    readonly text?: string;

    @ApiProperty({ type: [FileDto], description: 'Файли повідомлення' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FileDto)
    readonly files?: FileDto[];
}

export class MessageDto {
    @ApiProperty({ example: 1, description: 'ID повідомлення' })
    readonly id: number;

    @ApiProperty({ example: 'Повідомлення', description: 'Текст повідомлення' })
    readonly text?: string;

    @ApiProperty({ example: 6, description: 'ID чату повідомлення' })
    readonly chat_id?: number;

    @ApiProperty({ type: UserDto, description: 'Дані власника повідомлення' })
    readonly user: UserDto;

    @ApiProperty({ type: [FileDto], description: 'Файли повідомлення' })
    readonly files?: FileDto[];
}