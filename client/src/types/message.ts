import type { Chat } from "./chat";
import type { User } from "./user";

export interface Message {
    id: number,
    text: string,
    createdAt: string,
    user: User,
    chat?: Chat
}