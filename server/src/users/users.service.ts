import { Body, HttpException, HttpStatus, Injectable, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError } from 'sequelize';
import { RegisterUserDto } from 'src/dto/register-user.dto';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { Follow } from 'src/models/follow.model';
import { User } from 'src/models/users.model';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly postsService: PostsService,
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

    async findUsersByLogin(userId: number, login: string) {
        return await this.userModel.findAll({
            where: {
                id: {
                    [Op.ne]: userId
                },
                login: {
                    [Op.iLike]: `%${login}%`
                }
            }
        })
    }

    async getUserProfileByLogin(login: string) {
        const user = await this.userModel.findOne({ where: { login } });
        if (!user) {
            throw new HttpExceptionCode([{
                message: "User not found",
                code: "LOGIN_INVALID"
            }], HttpStatus.BAD_REQUEST);
        }

        const plainUser = user.get({ plain: true });
        const userPostsCount = await this.postsService.getUserPostsCount(plainUser.id);


        return {
            user: plainUser,
            about: null,
            bannerUrl: "bannerUrl",
            avatarUrl: "avatarUrl",
            following: 0,
            followers: 0,
            postsNumber: userPostsCount
        }
    }

    async getFollowers(userId: number) {
        const user = await this.userModel.findByPk(userId);
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const followers = await user.$get('followers');
        return followers;
    }

    async getFollowing(userId: number) {
        const user = await this.userModel.findByPk(userId);
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        const following = await user.$get('following');
        return following;
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

        try {
            await this.followModel.create({ follower_id, following_id });
            return { success: true }
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                // помилка, якщо індекс порушено
                throw new HttpException('Already following this user', HttpStatus.CONFLICT);
            }

            // Інші типи помилок (БД недоступна, неправильні поля тощо)
            console.error(error);
            throw new HttpException('Could not follow user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unfollowUser(follower_id: number, following_id: number) {
        await this.followModel.destroy({
            where: { follower_id, following_id },
        });
        return { success: true }
    }

}
