import type { AxiosResponse } from 'axios';
import type { Post } from '../types/post';
import type { Profile } from '../types/profile';
import api from './axios';
import type { Chat } from '../types/chat';
import type { User } from '../types/user';
import type { Message } from '../types/message';
import type { ChatUser } from '../types/chatUser';
import type { File } from '../types/file';
import type { Comment } from '../types/comment';
import type Auth from '../types/auth';



async function fetch(promise: Promise<AxiosResponse<any, any>>) {
	try {
		const response = await promise;
		return response.data;
	} catch (err: any) {
		if (err.response) {
			// помилки валідації від ValidationPipe
			if (err.response.data.errors) {
				console.log("err.response.data.errors", err.response.data.errors);
				throw err.response.data.errors
			}
			// Інші помилки
			console.log("err.response", err.response);
			throw err.response.data;
		} else {
			console.error("Network error or unknown:", err.message);
			throw err;
		}
	}
}




export async function fetchAuth(
	body: Auth,
	isSignup: boolean
): Promise<User> {
	return await fetch(
		api.post(`/api/auth/${isSignup ? 'register' : 'login'}`,
			body,
			{
				headers: {
					"Content-Type": "application/json",
				}
			}
		)
	)
}

export async function fetchLogout(): Promise<boolean> {
	return await fetch(api.post('/api/auth/logout'));
}

export async function fetchMe(): Promise<User> {
	return await fetch(api.get('/api/users/me'));
}

export async function fetchCheckAuth(): Promise<boolean> {
	return await fetch(api.get('/api/users/check-auth'));
}

export async function fetchProfile(login: string): Promise<Profile> {
	return await fetch(api.get(`/api/users/profile/${login}`));
}

export async function fetchFollow(id: number): Promise<{
	following: boolean,
	userId: number
}> {
	return await fetch(api.post(`/api/users/follow/${id}`));
}

export async function fetchUnfollow(id: number): Promise<boolean> {
	return await fetch(api.delete(`/api/users/follow/${id}`));
}



export async function fetchSearch(login: string, limit: number = 20): Promise<User[]> {
	return await fetch(
		api.get(`/api/users/find/${login}`, {
			params: {
				limit
			}
		})
	);
}




export async function fetchFeed(cursor?: number, refresh = false, limit: number = 20): Promise<Post[]> {
	return await fetch(api.get('/api/posts/news/feed', {
		params: {
			cursor,
			limit,
			refresh
		}
	}));
}

export async function fetchGetPost(id: number): Promise<Post> {
	return await fetch(api.get(`/api/posts/${id}`));
}

export async function fetchCreatePost(post: { text: string, tags?: string[], files?: File[] }): Promise<number> {
	return await fetch(
		api.post('/api/posts',
			post,
			{
				headers: {
					"Content-Type": "application/json",
				}
			}
		)
	);
}

export async function fetchUserPosts(login: string, cursor?: string, limit: number = 20): Promise<Post[]> {
	return await fetch(api.get(`/api/posts/user/${login}`, {
		params: {
			cursor,
			limit
		}
	}));
}

export async function fetchDeletePost(id: number): Promise<boolean> {
	return await fetch(api.delete(`/api/posts/${id}`));
}

export async function fetchFiles(formData: FormData): Promise<File[]> {
	return await fetch(api.post(`/api/storage/upload`, formData));
}



export async function fetchUserChats(): Promise<Chat[]> {
	return await fetch(api.get(`/api/chats`));
}

export async function fetchFindChatUsersByLogin(login: string, limit?: number): Promise<ChatUser[]> {
	return await fetch(
		api.get(`/api/chats/find/${login}`, {
			params: {
				limit
			}
		})
	);
}



export async function fetchMessages(chatId: number, cursor?: string, limit: number = 30): Promise<Message[]> {
	return await fetch(
		api.get(`/api/chats/${chatId}/messages`, {
			params: {
				cursor,
				limit
			}
		})
	)
}


export async function fetchComments(postId: number, cursor?: string, limit: number = 30): Promise<Comment[]> {
	return await fetch(
		api.get(`/api/comments/post/${postId}`, {
			params: {
				cursor,
				limit
			}
		})
	)
}

export async function fetchCreateComment(comment: { post_id: number, text: string, files?: File[] }): Promise<Comment[]> {
	return await fetch(
		api.post(`/api/comments`,
			comment,
			{
				headers: {
					"Content-Type": "application/json",
				}
			}
		)
	)
}