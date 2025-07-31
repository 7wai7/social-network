import { FileDto } from "./create-file.dto";

export class ChatMessageDto {
    readonly id?: number;
    readonly user_id: number; // власник повідомлення
    readonly recipient_id: number; // кому написав. потрібно лише для створення нового чату з невідомим користувачем
    readonly chat_id: number;
    readonly text: string;
    readonly files?: FileDto[];
    readonly filesToDeleteIds?: number[];
}