export interface Post {
	id: string;
	text: string;
	createdAt: string;
	files: {
		id: number,
		filename: string,
		mimetype: string,
		createdAt: string
	}[]
	user: {
		id: number,
		login: string
	}
}
