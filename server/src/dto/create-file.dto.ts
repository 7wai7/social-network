import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { isNumber, IsString, IsUrl } from "class-validator";

export class CreateFileDto {
    @ApiProperty({ example: 'picture.png' })
    @IsString()
    readonly originalname: string;

    @ApiProperty({ example: 'image/png' })
    @IsString()
    readonly mimetype: string;

    @ApiProperty({ example: 10000 })
    @IsString()
    @Type(() => Number)
    readonly size: number;

    @ApiProperty({ example: 'https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png' })
    @IsString()
    @IsUrl()
    readonly url: string;
}

export class FileDto {
    @ApiProperty({ example: 1 })
    readonly id: number;

    @ApiProperty({ example: 'picture.png' })
    readonly originalname: string;

    @ApiProperty({ example: 'image/png' })
    readonly mimetype: string;

    @ApiProperty({ example: 10000 })
    readonly size: number;

    @ApiProperty({ example: 'https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png' })
    readonly url: string;
}