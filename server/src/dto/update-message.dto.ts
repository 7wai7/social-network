import { ApiProperty } from "@nestjs/swagger";
import { FileDto } from "./create-file.dto";
import { IsArray, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";


export class UpdateMessageDto {
    @ApiProperty({ example: 1, description: 'ID повідомлення' })
    @IsNumber()
    readonly id: number;

    @ApiProperty({ example: 1, description: 'ID власника повідомлення' })
    readonly user_id: number;

    @ApiProperty({ example: 'Повідомлення', description: 'Текст повідомлення' })
    @IsOptional()
    readonly text?: string;

    @ApiProperty({ type: [FileDto], description: 'Нові файли для додавання' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FileDto)
    readonly files?: FileDto[];

    @ApiProperty({ type: [Number], description: 'ID файлів для видалення' })
    @IsOptional()
    @IsArray()
    @Type(() => Number)
    readonly filesToDeleteIds?: number[];
}
