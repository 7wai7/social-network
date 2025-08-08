import type { User } from "./user";

export interface Profile {
	user: User,
    about: string,
	bannerUrl: string,
	avatarUrl: string,
    followingCount: number,
    followersCount: number,
	postsCount: number,
	isOwnProfile: boolean,
	isFollowing: boolean
}