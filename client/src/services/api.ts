import type { Post } from '../types/post';
import api from './axios';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ1c2VyNUBnbWFpbC5jb20iLCJpYXQiOjE3NTI2ODcyMzEsImV4cCI6MTc1Mjc3MzYzMX0.HNJZueS6ZJPm1zmaz8VGKRofxKHaIJv2mgDaU_RHu4M'

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

export async function fetchCheckAuth(): Promise<boolean> {
	const response = await api.get('/api/users/check-auth');

	console.log(response.data);
	return response.data;
}

export async function fetchFeed(): Promise<Post[]> {
	const response = await api.get('/api/posts/news/feed', {
		/* headers: {
			"Authorization": `Bearer ${token}`
		} */
	});

	console.log(response.data);
	return response.data;
}

export async function fetchPost(formData: FormData): Promise<boolean> {
	const response = await api.post('/api/posts',
		formData,
		{
			headers: {
				"Authorization": `Bearer ${token}`
			}
		}
	);

	console.log(response.data);
	return response.data;
}