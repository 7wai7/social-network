import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostDto } from 'src/dto/create-post.dto';
import { Post } from 'src/models/posts.model';
import { PostFiles } from 'src/models/postFiles.model';
import { User } from 'src/models/users.model';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { StorageService } from 'src/storage/storage.service';
import { literal, Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Files } from 'src/models/files.model';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post) private postsModel: typeof Post,
        @InjectModel(Files) private filesModel: typeof Files,
        @InjectModel(PostFiles) private postFilesModel: typeof PostFiles,
        private readonly storageService: StorageService,
        @Inject(Sequelize) private readonly sequelize: Sequelize,
    ) { }

    async getUserPostsCount(userId: number) {
        const posts = await this.postsModel.findAll({
            where: {
                user_id: userId
            }
        })

        return posts.length;
    }

    async getUserPosts(user_id: number, limit: number = 20, cursor?: string) {
        const where: any = {
            user_id
        };

        if (cursor) {
            where.createdAt = { [Op.lt]: cursor };
        }

        return await this.postsModel.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user'
                },
                {
                    model: Files,
                    as: 'files',
                    through: { attributes: [] }, // щоб не повертати колонки зв’язувальної таблиці
                    required: false, // LEFT JOIN
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
        })

    }

    async getNewsFeed(userId: number, limit: number = 20, cursor?: string) {
        const where: any = {};

        if (cursor) {
            where.createdAt = { [Op.lt]: cursor };
        }

        return await this.postsModel.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    include: [{
                        model: User,
                        as: 'followers',
                        where: { id: userId },
                        required: true,
                        attributes: [],
                        through: { attributes: [] },
                    }],
                },
                {
                    model: Files,
                    as: 'files',
                    through: { attributes: [] },
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
        });
    }

    async createPost(postDto: PostDto) {
        const transaction = await this.sequelize.transaction();

        try {
            const post = await this.postsModel.create(postDto, { transaction });

            if (postDto.files && postDto.files.length > 0) {
                const filesRaws = await this.filesModel.bulkCreate(postDto.files, { transaction });
                await post.$set('files', filesRaws, { transaction });
            }

            await transaction.commit();

            const fullPost = await this.postsModel.findByPk(post.id, {
                attributes: ['id', 'text', 'createdAt'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'login']
                    },
                    {
                        model: Files,
                        as: 'files',
                        through: { attributes: [] }, // щоб не повертати колонки зв’язувальної таблиці
                        required: false, // LEFT JOIN
                    }
                ]
            })

            return fullPost?.get({ plain: true })
        } catch (error) {
            await transaction.rollback();
            throw new HttpException('Error create post: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deletePost(postId: number) {
        const transaction = await this.sequelize.transaction();

        try {
            const post = await this.postsModel.findByPk(postId, {
                include: [{
                    model: Files,
                    as: 'files',
                    through: { attributes: [] },
                    required: false
                }],
                transaction
            });
            if (!post) {
                throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
            }

            // Отримуємо всі file_id
            const plainPost = post.get({ plain: true });
            const files = [...plainPost.files];
            const fileIds = files.map(file => file.id);

            // Видаляємо зв’язки в post_files
            await this.postFilesModel.destroy({
                where: { post_id: postId },
                transaction
            });

            // Видаляємо файли (якщо потрібно повністю їх прибрати з БД)
            if (fileIds.length > 0) {
                await this.filesModel.destroy({
                    where: { id: fileIds },
                    transaction
                });
            }

            // Видаляємо сам пост
            await this.postsModel.destroy({
                where: { id: postId },
                transaction
            });

            // Видаляєм файли
            for (const file of files) {
                const filename = file.url.split('/').pop();
                if (filename) await this.storageService.deleteFile(filename);
            }

            await transaction.commit();
            return plainPost;
        } catch (error) {
            console.log(error);

            await transaction.rollback();
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deletePostByOwner(id: number, userId: number) {
        const post = await this.postsModel.findOne({ where: { id } })
        if (!post) throw new HttpException("Post not found", HttpStatus.NOT_FOUND);
        const plainPost = post.get({ plain: true });
        if (plainPost.user_id !== userId) throw new HttpException('Forbidden: not your message', HttpStatus.FORBIDDEN);

        return await this.deletePost(id);
    }

}
