import type { File } from "./file";
import type { User } from "./user";

export interface Post {
	id: number,
	text?: string,
	createdAt: string,
	files: File[],
	tags: { name: string }[],
	user: User,
	isOwnPost: boolean
}
