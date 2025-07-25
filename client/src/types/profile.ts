import type { User } from "./user";

export interface Profile {
	user: User,
    about: string,
	bannerUrl: string,
	avatarUrl: string,
    following: number,
    followers: number,
	postsNumber: number
}