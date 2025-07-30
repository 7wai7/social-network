import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostDto } from 'src/dto/create-post.dto';
import { Post } from 'src/models/posts.model';
import { PostFiles } from 'src/models/postFiles.model';
import { User } from 'src/models/users.model';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { StorageService } from 'src/storage/storage.service';
import { literal } from 'sequelize';
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
        return await this.postsModel.findAll({
            where: {
                user_id
            },
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

    async getNewsFeed(userId: number, limit: number = 20, offset: number = 0) {
        return await this.postsModel.findAll({
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
                    model: PostFiles,
                    as: 'files',
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
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
















        // if (!postDto.text && files.length === 0) {
        //     throw new HttpExceptionCode(
        //         [{ message: 'Post must contain either text or at least one file', code: 'NO_CONTENT' }],
        //         HttpStatus.BAD_REQUEST
        //     );
        // }

        // if (files.length > 10) {
        //     throw new HttpExceptionCode(
        //         [{ message: 'Too many files', code: 'TOO_MANY_FILES' }],
        //         HttpStatus.BAD_REQUEST
        //     );
        // }

        // if (files.some(f => f.size > 10 * 1024 * 1024)) {
        //     throw new HttpExceptionCode(
        //         [{ message: 'Too big files', code: 'TOO_BIG_FILES' }],
        //         HttpStatus.BAD_REQUEST
        //     );
        // }

        // return await this.postsModel.create(postDto);

        // try {
        //     for (const file of files) {
        //         const { url, filename } = await this.storageService.uploadFile(file);

        //         await this.postFilesModel.create({
        //             post_id: plainPost.id,
        //             originalname: file.originalname,
        //             filename,
        //             mimetype: file.mimetype,
        //             url,
        //         });
        //     }

        //     return true;
        // } catch (error) {
        //     console.error('File upload error:', error);

        //     // Rollback
        //     await this.postFilesModel.destroy({ where: { post_id: plainPost.id } });
        //     await post.destroy();

        //     throw new HttpExceptionCode(
        //         [{ message: "Uploading error", code: "UPLOAD_ERROR" }],
        //         HttpStatus.INTERNAL_SERVER_ERROR
        //     );
        // }
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
                if(filename) await this.storageService.deleteFile(filename);
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
