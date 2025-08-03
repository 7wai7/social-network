import { ApiProperty } from "@nestjs/swagger";
import { FileDto } from "./create-file.dto";

export class PostDto {
    @ApiProperty({ example: 10 })
    readonly id?: number;

    @ApiProperty({ example: 1 })
    readonly user_id: number;

    @ApiProperty({ example: 'Мій перший пост' })
    readonly text: string;

    @ApiProperty({
        type: [FileDto],
        example: [
            {
                id: 1,
                originalname: 'picture.png',
                mimetype: 'image/png',
                url: 'https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png',
            },
            {
                id: 2,
                originalname: 'text.txt',
                mimetype: 'text/plain',
                url: 'https://storage.googleapis.com/bucket/1a6fde06-9b92-4065-9c00-a713bdff8f7d.txt',
            },
        ]
    })
    readonly files?: FileDto[];

    @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
    readonly createdAt?: Date;
}