import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostFileDto } from 'src/dto/create-post-file.dto';
import { PostDto } from 'src/dto/create-post.dto';
import { Post } from 'src/models/posts.model';
import { PostFile } from 'src/models/postFile.model';
import { User } from 'src/models/users.model';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post) private postsModel: typeof Post,
        @InjectModel(PostFile) private postFilesModel: typeof PostFile
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
                [
                    {
                        message: 'Post must contain either text or at least one file',
                        code: 'NO_CONTENT'
                    }
                ],
                HttpStatus.BAD_REQUEST
            );
        }

        if (files.length > 10) {
            throw new HttpExceptionCode(
                [
                    {
                        message: 'Too many files',
                        code: 'TOO_MANY_FILES'
                    }
                ], HttpStatus.BAD_REQUEST);
        }

        if (files.some(f => f.size > 10_000_000_000_000)) {
            throw new HttpExceptionCode(
                [
                    {
                        message: 'Too big files',
                        code: 'TOO_BIG_FILES'
                    }
                ], HttpStatus.BAD_REQUEST);
        }

        const post = await this.postsModel.create(postDto);
        const plainPost = post.get({ plain: true });
        const filesDir = path.join(process.cwd(), 'data', 'posts', `post_${plainPost.id}`);

        try {
            if (files.length > 0) {
                fs.mkdirSync(filesDir, { recursive: true });

                for (const file of files) {
                    const ext = path.extname(file.originalname);
                    // const base = path.basename(file.originalname, ext);
                    const filename = `${randomUUID()}${ext}`;

                    await this.postFilesModel.create({
                        post_id: post.id,
                        filename,
                        mimetype: file.mimetype
                    });

                    const targetPath = path.join(filesDir, filename);
                    fs.writeFileSync(targetPath, file.buffer);
                }
            }

            return true;
        } catch (error) {
            console.log(error);

            await this.postFilesModel.destroy({
                where: {
                    post_id: post.id
                }
            })
            await post.destroy();

            // Видаляємо папку з файлами, якщо вона створилася
            if (fs.existsSync(filesDir)) {
                fs.rmSync(filesDir, { recursive: true, force: true });
            }

            throw new HttpExceptionCode([
                {
                    message: "Uploading error",
                    code: "UPLOAD_ERROR"
                }
            ], HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deletePost(id: number) {
        const postDir = path.join(__dirname, '..', '..', 'data', 'posts', `post_${id}`);

        await Promise.all([
            this.postsModel.destroy({ where: { id } }),
            this.postFilesModel.destroy({ where: { post_id: id } }),
        ]);

        if (fs.existsSync(postDir)) {
            fs.rmSync(postDir, { recursive: true, force: true });
        }
    }
}
