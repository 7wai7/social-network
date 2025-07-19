import type { Post } from '../types/post';
import type { Profile } from '../types/profile';
import api from './axios';

export async function fetchRegister(
	body: {
		login: string
		email: string,
		password: string
	}
): Promise<object> {
	try {
		const response = await api.post('/api/auth/register',
			body,
			{
				headers: {
					"Content-Type": "application/json",
				}
			});
		console.log(response.data);
		return response.data;
	} catch (err: any) {
		if (err.response) {
			throw err.response.data;
		} else {
			console.error("Network error or unknown:", err.message);
			throw err;
		}
	}
}

export async function fetchLogin(
	body: {
		email: string,
		password: string
	}
): Promise<object> {
	try {
		const response = await api.post('/api/auth/login',
			body,
			{
			headers: {
				"Content-Type": "application/json",
			}
		});
		return response.data;
	} catch (err: any) {
		if (err.response) {
			throw err.response.data;
		} else {
			console.error("Network error or unknown:", err.message);
			throw err;
		}
	}
}

export async function fetchMe(): Promise<{ id: string, login: string }> {
	const response = await api.get('/api/users/me');
	console.log(response.data);
	return response.data;
}

export async function fetchCheckAuth(): Promise<boolean> {
	const response = await api.get('/api/users/check-auth');
	console.log(response.data);
	return response.data;
}

export async function fetchProfile(login: string): Promise<Profile> {
	const response = await api.get(`/api/users/profile/${login}`);
	console.log(response.data);
	return response.data;
}

export async function fetchUserPosts(login: string): Promise<Post[]> {
	const response = await api.get(`/api/posts/user/${login}`);
	console.log(response.data);
	return response.data;
}

export async function fetchFeed(): Promise<Post[]> {
	const response = await api.get('/api/posts/news/feed');
	console.log(response.data);
	return response.data;
}

export async function fetchPost(formData: FormData): Promise<boolean> {
	const response = await api.post('/api/posts', formData);
	console.log(response.data);
	return response.data;
}

export async function fetchFollow(id: number): Promise<boolean> {
	const response = await api.post(`/api/users/follow/${id}`);
	console.log(response.data);
	return response.data;
}

export async function fetchUnfollow(id: number): Promise<boolean> {
	const response = await api.delete(`/api/users/follow/${id}`);
	console.log(response.data);
	return response.data;
}

export async function fetchDeletePost(id: number): Promise<boolean> {
	const response = await api.delete(`/api/posts/${id}`);
	console.log(response.data);
	return response.data;
}