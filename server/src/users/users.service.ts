import { Body, HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError } from 'sequelize';
import { RegisterUserDto } from 'src/dto/register-user.dto';
import { UserProfileDto } from 'src/dto/user-profile.dto';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { Follow } from 'src/models/follow.model';
import { Post } from 'src/models/posts.model';
import { User } from 'src/models/users.model';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        @InjectModel(Follow) private followModel: typeof Follow
    ) { }


    async create(dto: RegisterUserDto) {
        return await this.userModel.create(dto);
    }

    async getUser(id: number) {
        return await this.userModel.findByPk(id);
    }

    async getUserByLogin(login: string) {
        return await this.userModel.findOne({ where: { login }, include: { all: true } });
    }

    async getUserByEmail(email: string) {
        return await this.userModel.findOne({ where: { email }, include: { all: true } });
    }

    async getAll() {
        const users = await this.userModel.findAll();
        return users;
    }

    async findUsersByLogin(userId: number, login: string, limit: number = 8) {
        return await this.userModel.findAll({
            where: {
                id: {
                    [Op.ne]: userId
                },
                login: {
                    [Op.iLike]: `%${login}%`
                }
            },
            order: [['login', 'ASC']],
            limit
        })
    }

    async getUserProfileByLogin(login: string, currentUserId: number) {
        const user = await this.userModel.findOne(
            {
                where: { login },
                include: [
                    { model: User, as: 'followers' },
                    { model: User, as: 'following' },
                    { model: Post, as: 'posts' }
                ]
            }
        );


        if (!user) {
            throw new HttpExceptionCode([{
                field: 'login',
                message: "User not found",
                code: "LOGIN_INVALID"
            }], HttpStatus.BAD_REQUEST);
        }

        const plainUser = user.get({ plain: true });


        const profile: UserProfileDto = {
            user: {
                id: plainUser.id,
                login: plainUser.login
            },
            about: undefined,
            bannerUrl: "bannerUrl",
            avatarUrl: "avatarUrl",
            followingCount: plainUser.following.length,
            followersCount: plainUser.followers.length,
            postsCount: plainUser.posts.length,
            isOwnProfile: currentUserId === plainUser.id,
            isFollowing: plainUser.followers.some(f => f.id === currentUserId)
        }

        return profile;
    }

    async getFollowers(userId: number) {
        const user = await this.userModel.findByPk(userId, {
            include: [{
                model: User,
                as: 'followers',
                attributes: ['id', 'login'],
                through: { attributes: [] }
            }]
        });
        const plainUser = user?.get({ plain: true });
        if (!plainUser) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        return plainUser.followers;
    }

    async getFollowing(userId: number) {
        const user = await this.userModel.findByPk(userId, {
            include: [{
                model: User,
                as: 'following',
                attributes: ['id', 'login'],
                through: { attributes: [] }
            }]
        });
        const plainUser = user?.get({ plain: true });
        if (!plainUser) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        return plainUser.following;
    }

    async followUser(follower_id: number, following_id: number) {
        if (follower_id === following_id) {
            throw new HttpException('Cannot follow yourself', HttpStatus.BAD_REQUEST);
        }

        const user = await this.userModel.findByPk(follower_id);
        const otherUser = await this.userModel.findByPk(following_id);

        if (!user || !otherUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const alreadyFollowing = await this.followModel.findOne({
            where: { follower_id, following_id }
        })


        try {
            if (alreadyFollowing) {
                await alreadyFollowing.destroy();
            } else {
                await this.followModel.create({ follower_id, following_id });
            }

            return {
                following: !alreadyFollowing, // true або false
                userId: following_id
            }
        } catch (error) {
            console.error(error);
            throw new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unfollowUser(follower_id: number, following_id: number) {
        if (follower_id === following_id) {
            throw new HttpException('Cannot unfollow yourself', HttpStatus.BAD_REQUEST);
        }

        await this.followModel.destroy({
            where: { follower_id, following_id },
        });

        return {
            following: false,
            userId: following_id
        }
    }

}
