import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';

@Injectable()
export class StorageService {
    private storage: Storage;
    private bucketName = 'social-network-bucket';

    constructor() {
        this.storage = new Storage({
            keyFilename: path.join(process.cwd(), 'social-network-uploads-4fb82798ee46.json'),
            projectId: 'social-network-uploads'
        })
    }

    async uploadFiles(files: Array<Express.Multer.File>) {
        if (files.length === 0) return;

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

    async deleteFilesByUrls(urls: string[]): Promise<void> {
        for (const url of urls) {
            const filename = url.split('/').pop();
            if(filename) await this.deleteFile(filename);
        }
    }

}
