import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostFileDto } from 'src/dto/create-post-file.dto';
import { PostDto } from 'src/dto/create-post.dto';
import { Post } from 'src/models/posts.model';
import { PostFile } from 'src/models/postFile.model';
import { User } from 'src/models/users.model';
import * as fs from 'fs';
import * as path from 'path';

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
            throw new HttpException(
                'Post must contain either text or at least one file',
                HttpStatus.BAD_REQUEST
            );
        }

        const post = await this.postsModel.create(postDto);
        const plainPost = post.get({ plain: true });
        const postDir = path.join(__dirname, '..', '..', 'data', 'posts', `post_${plainPost.id}`);

        try {
            if (files.length > 0) {
                fs.mkdirSync(postDir, { recursive: true });

                for (const file of files) {
                    const [name, ext] = file.originalname.split('.');
                    const filename = name + "_" + Math.floor(Math.random() * 1000) + `.${ext}`;
                    await this.postFilesModel.create({
                        post_id: post.id,
                        filename,
                        mimetype: file.mimetype
                    });

                    const targetPath = path.join(postDir, filename);
                    fs.writeFileSync(targetPath, file.buffer);
                }
            }
        } catch (error) {
            console.log(error);

            await this.postFilesModel.destroy({
                where: {
                    post_id: post.id
                }
            })
            await post.destroy();

            // Видаляємо папку з файлами, якщо вона створилася
            if (fs.existsSync(postDir)) {
                fs.rmSync(postDir, { recursive: true, force: true });
            }

            throw new HttpException("Uploading error", HttpStatus.INTERNAL_SERVER_ERROR);
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
