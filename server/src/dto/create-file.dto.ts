import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUrl } from "class-validator";

export class CreateFileDto {
    @IsString()
    @ApiProperty({ example: 'picture.png' })
    readonly originalname: string;

    @IsString()
    @ApiProperty({ example: 'image/png' })
    readonly mimetype: string;

    @IsString()
    @IsUrl()
    @ApiProperty({ example: 'https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png' })
    readonly url: string;
}

export class FileDto {
    @ApiProperty({ example: 1 })
    readonly id: number;

    @ApiProperty({ example: 'picture.png' })
    readonly originalname: string;

    @ApiProperty({ example: 'image/png' })
    readonly mimetype: string;

    @ApiProperty({ example: 'https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png' })
    readonly url: string;
}