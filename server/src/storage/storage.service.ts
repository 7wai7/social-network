import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import * as iconv from 'iconv-lite';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class StorageService {
    private storage: Storage;

    constructor() {
        this.storage = new Storage({
            keyFilename: path.join(process.cwd(), 'social-network-uploads-4fb82798ee46.json'),
            projectId: 'social-network-uploads'
        })
    }


    async getDownloadLink(filename: string, originalname: string) {
        const bucket = this.storage.bucket(String(process.env.GCS_BUCKET_NAME));
        const file = bucket.file(filename);
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 5 * 60 * 1000, // 5 хвилин
            responseDisposition: `attachment; filename="${originalname}"`
        });

        return { url };
    }

    async uploadFiles(files: Array<Express.Multer.File>) {
        if (files.length === 0) return [];

        if (files.length > 10) {
            throw new HttpExceptionCode(
                [{ message: 'Too many files', code: 'TOO_MANY_FILES' }],
                HttpStatus.BAD_REQUEST
            );
        }

        if (files.some(f => f.size > 10 * 1024 * 1024)) {
            throw new HttpExceptionCode(
                [{ message: 'Too big files', code: 'TOO_BIG_FILES' }],
                HttpStatus.PAYLOAD_TOO_LARGE
            );
        }

        
        try {
            const filesData: {
                originalname: string,
                mimetype: string,
                size: number,
                url: string
            }[] = [];

            for (const file of files) {
                const { url } = await this.uploadFile(file);

                filesData.push({
                    originalname: iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf8'),
                    mimetype: file.mimetype,
                    size: file.size,
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
        const bucket = this.storage.bucket(String(process.env.GCS_BUCKET_NAME));
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
                    url: `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`
                });
            });
            stream.end(file.buffer);
        });
    }

    async deleteFile(filename: string): Promise<void> {
        const bucket = this.storage.bucket(String(process.env.GCS_BUCKET_NAME));
        await bucket.file(filename).delete();
    }

    async deleteFilesByUrls(urls: string[]): Promise<void> {
        for (const url of urls) {
            const filename = url.split('/').pop();
            if(filename) await this.deleteFile(filename);
        }
    }

}
