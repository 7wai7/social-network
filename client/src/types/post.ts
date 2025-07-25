import type { User } from "./user";

export interface Post {
	id: number;
	text: string;
	createdAt: string;
	files: {
		id: number,
		originalname: string,
		filename: string,
		mimetype: string,
		url: string,
		createdAt: string
	}[]
	user: User
}
