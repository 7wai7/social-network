import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CommentDto, CreateCommentDto } from 'src/dto/create-comment.dto';
import { CommentFiles } from 'src/models/commentFiles.model';
import { Comment } from 'src/models/comments.model';
import { Files } from 'src/models/files.model';
import { User } from 'src/models/users.model';
import { Post } from 'src/models/posts.model';
import { StorageService } from 'src/storage/storage.service';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment) private commentModel: typeof Comment,
        @InjectModel(Files) private filesModel: typeof Files,
        @InjectModel(Post) private postsModel: typeof Post,
        @InjectModel(CommentFiles) private commentFilesModel: typeof CommentFiles,
        @Inject(Sequelize) private readonly sequelize: Sequelize,
        private readonly storageService: StorageService,
    ) { }


    async getCommentsByPostId(userId: number, post_id: number, cursor?: string, limit: number = 20) {
        const where: any = {
            post_id
        };

        if (cursor) {
            where.createdAt = { [Op.lt]: cursor };
        }

        return await this.commentModel.scope(Comment.withOwnership(userId)).findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'login']
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
        })
    }

    async createComment(commentDto: CreateCommentDto) {
        console.log("commentDto", commentDto);

        const post = await this.postsModel.findByPk(commentDto.post_id);
        if (!post) throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        if (!commentDto.text?.trim() && !commentDto.files?.length) throw new HttpException('Comment must contain either text or at least one file.', HttpStatus.FORBIDDEN);

        const transaction = await this.sequelize.transaction();

        try {
            const newComment = await this.commentModel.create(commentDto, { transaction });

            if (commentDto.files && commentDto.files.length > 0) {
                const filesRaws = await this.filesModel.bulkCreate(commentDto.files, { transaction });
                await newComment.$set('files', filesRaws, { transaction });
            }

            await transaction.commit();


            const fullComment = await this.commentModel.findByPk(newComment.id, {
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

            return fullComment?.get({ plain: true });
        } catch (error) {
            console.log(error);

            await transaction.rollback();
            throw new HttpException('Error create comment: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async deleteComment(id: number) {
        const transaction = await this.sequelize.transaction();

        try {
            const comment = await this.commentModel.findByPk(id, {
                include: [{
                    model: Files,
                    as: 'files',
                    through: { attributes: [] },
                    required: false
                }],
                transaction
            });
            if (!comment) {
                throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
            }

            // Отримуємо всі file_id
            const plainComment = comment.get({ plain: true });
            const files = [...plainComment.files];
            const fileIds = files.map(file => file.id);

            // Видаляємо зв’язки в post_files
            await this.commentFilesModel.destroy({
                where: { comment_id: id },
                transaction
            });

            // Видаляємо файли (якщо потрібно повністю їх прибрати з БД)
            if (fileIds.length > 0) {
                await this.filesModel.destroy({
                    where: { id: fileIds },
                    transaction
                });
            }

            // Видаляємо сам коментар
            await this.commentModel.destroy({
                where: { id },
                transaction
            });

            // Видаляєм файли
            for (const file of files) {
                const filename = file.url.split('/').pop();
                if (filename) await this.storageService.deleteFile(filename);
            }

            await transaction.commit();
            return true;
        } catch (error) {
            console.log(error);

            await transaction.rollback();
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteCommentByOwner(id: number, userId: number) {
        const comment = await this.commentModel.findByPk(id);
        if (!comment) throw new HttpException("Comment not found", HttpStatus.NOT_FOUND);
        const plainComment = comment.get({ plain: true });
        if (plainComment.user_id !== userId) throw new HttpException('Forbidden: not your comment', HttpStatus.FORBIDDEN);

        return await this.deleteComment(id);
    }
}
