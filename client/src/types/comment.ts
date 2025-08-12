import type { File } from "./file";
import type { Post } from "./post";
import type { User } from "./user";

export interface Comment {
    id: number,
    user: User,
    post: Post,
    text: string,
    files: File[]
    createdAt: string,
    isOwnComment: boolean
}