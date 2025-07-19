export interface Profile {
	user: {
		id: string,
		email: string,
		login: string
	},
    about: string,
	bannerUrl: string,
	avatarUrl: string,
    following: number,
    followers: number,
	postsNumber: number
}