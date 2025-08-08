import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "./login-user.dto";

export class UserProfileDto {
    @ApiProperty({ type: UserDto })
    readonly user: UserDto;
    
    @ApiProperty({ example: 'Про користувача' })
    readonly about?: string;

    @ApiProperty({ example: 'https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png' })
    readonly bannerUrl: string;

    @ApiProperty({ example: 'https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png' })
    readonly avatarUrl: string;

    @ApiProperty({ example: 10 })
    readonly followingCount: number;

    @ApiProperty({ example: 15 })
    readonly followersCount: number;

    @ApiProperty({ example: 20 })
    readonly postsCount: number

    @ApiProperty({ example: true })
    readonly isOwnProfile?: boolean;
    
    @ApiProperty({ example: false })
	readonly isFollowing?: boolean;
}