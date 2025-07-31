import type { File } from "./file";
import type { User } from "./user";

export interface Message {
    id: number,
    text: string,
    createdAt: string,
    user: User,
    chat_id: number,
    files: File[]
}