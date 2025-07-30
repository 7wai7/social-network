import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { Post } from 'src/models/posts.model';
import { Comment } from 'src/models/comments.model';
import { Files } from 'src/models/files.model';
import { User } from 'src/models/users.model';

@Injectable()
export class StorageService {
    private storage: Storage;
    private bucketName = 'social-network-bucket';

    constructor(
        @InjectModel(Post) private postModel: typeof Post,
        @InjectModel(Files) private filesModel: typeof Files,
        @Inject(Sequelize) private readonly sequelize: Sequelize,
    ) {
        this.storage = new Storage({
            keyFilename: path.join(process.cwd(), 'social-network-uploads-4fb82798ee46.json'),
            projectId: 'social-network-uploads'
        })
    }

    async uploadFiles(files: Array<Express.Multer.File>) {
        try {
            const filesData: {
                originalname: string,
                mimetype: string,
                url: string
            }[] = [];

            for (const file of files) {
                const { url } = await this.uploadFile(file);

                filesData.push({
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    url,
                });
            }

            return filesData;
        } catch (error) {
            console.error('Files upload error:', error);
            throw new HttpException('Error uploading files: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadFilesAndSaveDB(source_id: number, source_type: string, files: Array<Express.Multer.File>) {
        if (!['post', 'comment', 'message'].includes(source_type)) throw new HttpExceptionCode(
            [{ message: 'Not correct source type', code: 'NOT_CORRECT_TYPE' }],
            HttpStatus.BAD_REQUEST
        );


        let source: Post | null | undefined;
        switch (source_type) {
            case 'post':
                source = await this.postModel.findByPk(source_id, {
                    attributes: ['id', 'text', 'createdAt'],
                    include: {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'login']
                    }
                });
                break;

            default:
                break;
        }

        console.log("source", source);

        if (!source) throw new HttpExceptionCode(
            [{ message: 'Source not found', code: 'SOURCE_NOT_FOUND' }],
            HttpStatus.NOT_FOUND
        );


        if (files.length === 0) return source.get({ plain: true });

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


        const transaction = await this.sequelize.transaction();

        try {
            const filesData: {
                originalname: string,
                mimetype: string,
                url: string
            }[] = [];

            for (const file of files) {
                const { url } = await this.uploadFile(file);

                filesData.push({
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    url,
                });
            }

            const filesRaws = await this.filesModel.bulkCreate(filesData, { transaction });
            await source.$set('files', filesRaws, { transaction });

            await transaction.commit();

            switch (source_type) {
                case 'post':
                    const post = await this.postModel.findByPk(source_id, {
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
                    });
                    const plain = post?.get({ plain: true });
                    console.log("post", plain);

                    return plain;


                default:
                    break;
            }
        } catch (error) {
            console.error('Files upload error:', error);
            await transaction.rollback();
            throw new HttpException('Error uploading files: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
        const bucket = this.storage.bucket(this.bucketName);
        const ext = path.extname(file.originalname);
        const filename = `${randomUUID()}${ext}`;
        const blob = bucket.file(filename);
        const stream = blob.createWriteStream({
            resumable: false,
            metadata: { contentType: file.mimetype },
        });

        return new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('finish', () => {
                resolve({
                    url: `https://storage.googleapis.com/${this.bucketName}/${filename}`
                });
            });
            stream.end(file.buffer);
        });
    }

    async deleteFile(filename: string): Promise<void> {
        const bucket = this.storage.bucket(this.bucketName);
        await bucket.file(filename).delete();
    }

}
