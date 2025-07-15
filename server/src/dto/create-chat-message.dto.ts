
export class ChatMessageDto {
    readonly user_id: number; // власник повідомлення
    readonly recipient_id: number; // кому написав. потрібно лише для створення нового чату з невідомим користувачем
    readonly chat_id: number;
    readonly text: string;
    readonly files?: {
        readonly name: string;
        readonly type: string;
        readonly data: string; // base64 string
    }[];
}