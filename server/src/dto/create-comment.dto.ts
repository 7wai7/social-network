import { ApiProperty } from "@nestjs/swagger";
import { CreateFileDto, FileDto } from "./create-file.dto";
import { IsArray, IsNumber, isNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateCommentDto {

    @ApiProperty({ example: 1, description: 'ID власника коментаря' })
    readonly user_id: number;

    @ApiProperty({ example: 1, description: 'ID поста' })
    @IsNumber()
    readonly post_id: number;

    @ApiProperty({ example: 1, description: 'Текст коментаря' })
    @IsOptional()
    @IsString()
    readonly text?: string;

    @ApiProperty({ type: [CreateFileDto], description: 'Файли коментаря' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFileDto)
    readonly files?: CreateFileDto[];
}

export class CommentDto {

    @ApiProperty({ example: 1, description: 'ID власника коментаря' })
    readonly id: number;
    
    @ApiProperty({ example: 1, description: 'ID власника коментаря' })
    readonly user_id: number;
    
    @ApiProperty({ example: 1, description: 'ID поста' })
    readonly post_id: number;
    
    @ApiProperty({ example: 1, description: 'Текст коментаря' })
    readonly text: string;

    @ApiProperty({ type: [FileDto], description: 'Файли коментаря' })
    readonly files?: FileDto[];
}