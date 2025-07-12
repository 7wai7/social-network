import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CommentDto } from 'src/dto/create-comment.dto';
import { CommentFile } from 'src/models/commentFiles.model';
import { Comment } from 'src/models/comments.model';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment) private commentModel: typeof Comment,
        @InjectModel(CommentFile) private commentFileModel: typeof CommentFile,
    ) { }


    async getCommentsByPostId(id: number, offset: number = 0, limit: number = 20) {
        return await this.commentModel.findAll({
            where: {
                post_id: id
            },
            include: [
                {
                    model: CommentFile,
                    as: 'files'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        })
    }

    async createComment(commentDto: CommentDto, files: Array<Express.Multer.File> = []) {
        if (!commentDto.text && files.length === 0) {
            throw new HttpException(
                'Comment must contain either text or at least one file',
                HttpStatus.BAD_REQUEST
            );
        }

        const comment = await this.commentModel.create(commentDto);
        const plainComment = comment.get({ plain: true });
        const commentDir = path.join(__dirname, '..', '..', 'data', 'comments', `comment_${plainComment.id}`);

        try {
            if (files.length > 0) {
                fs.mkdirSync(commentDir, { recursive: true });

                for (const file of files) {
                    const [name, exp] = file.originalname.split('.');
                    const filename = name + "_" + Math.floor(Math.random() * 1000) + `.${exp}`;
                    await this.commentFileModel.create({
                        comment_id: comment.id,
                        filename,
                        mimetype: file.mimetype
                    });

                    const targetPath = path.join(commentDir, filename);
                    fs.writeFileSync(targetPath, file.buffer);
                }
            }
        } catch (error) {
            console.log(error);

            await this.commentFileModel.destroy({
                where: {
                    comment_id: comment.id
                }
            })
            await comment.destroy();

            // Видаляємо папку з файлами, якщо вона створилася
            if (fs.existsSync(commentDir)) {
                fs.rmSync(commentDir, { recursive: true, force: true });
            }

            throw new HttpException("Uploading error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
