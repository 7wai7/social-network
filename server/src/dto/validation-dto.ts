import { ApiProperty } from "@nestjs/swagger";

export class ValidationDto {
    @ApiProperty({ example: 'email', description: 'Назва поля з помилкою' })
    readonly field: string;

    @ApiProperty({ example: 'Invalid email format.', description: 'Повідомлення про помилку для цього поля' })
    readonly message: string;
}