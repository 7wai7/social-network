import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostFileDto } from 'src/dto/create-post-file.dto';
import { PostDto } from 'src/dto/create-post.dto';
import { Post } from 'src/models/posts.model';
import { PostFile } from 'src/models/postFile.model';
import { User } from 'src/models/users.model';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post) private postsModel: typeof Post,
        @InjectModel(PostFile) private postFilesModel: typeof PostFile,
        private readonly storageService: StorageService
    ) { }

    async getUserPosts(userId: number, offset: number = 20, limit: number = 0) {
        const posts = await this.postsModel.findAll({
            where: {
                user_id: userId
            },
            include: 'files'
        })

        return posts;
    }

    async getNewsFeed(userId: number, offset: number = 0, limit: number = 20) {
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
                    model: PostFile,
                    as: 'files',
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });
    }

    async createPost(postDto: PostDto, files: Array<Express.Multer.File> = []) {
        if (!postDto.text && files.length === 0) {
            throw new HttpExceptionCode(
                [{ message: 'Post must contain either text or at least one file', code: 'NO_CONTENT' }],
                HttpStatus.BAD_REQUEST
            );
        }

        if (files.length > 10) {
            throw new HttpExceptionCode(
                [{ message: 'Too many files', code: 'TOO_MANY_FILES' }],
                HttpStatus.BAD_REQUEST
            );
        }

        if (files.some(f => f.size > 10 * 1024 * 1024)) {
            throw new HttpExceptionCode(
                [{ message: 'Too big files', code: 'TOO_BIG_FILES' }],
                HttpStatus.BAD_REQUEST
            );
        }

        const post = await this.postsModel.create(postDto);
        const plainPost = post.get({ plain: true });

        try {
            for (const file of files) {
                const { url, filename, mimetype } = await this.storageService.uploadFile(file);

                await this.postFilesModel.create({
                    post_id: plainPost.id,
                    filename,
                    url,
                    mimetype,
                });
            }

            return true;
        } catch (error) {
            console.error('File upload error:', error);

            // Rollback
            await this.postFilesModel.destroy({ where: { post_id: plainPost.id } });
            await post.destroy();

            throw new HttpExceptionCode(
                [{ message: "Uploading error", code: "UPLOAD_ERROR" }],
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async deletePost(id: number) {
        const files = await this.postFilesModel.findAll({ where: { post_id: id } });

        for (const file of files) {
            try {
                await this.storageService.deleteFile(file.filename);
            } catch (err) {
                console.warn('Error deleting file from GCS:', err);
            }
        }

        await Promise.all([
            this.postsModel.destroy({ where: { id } }),
            this.postFilesModel.destroy({ where: { post_id: id } }),
        ]);
    }

}
