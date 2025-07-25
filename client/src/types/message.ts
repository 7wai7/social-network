import type { User } from "./user";

export interface Message {
    id: number,
    text: string,
    createdAt: string,
	avatarUrl: string,
    user: User
}