import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
    private storage: Storage;
    private bucketName = 'social-network-bucket';

    constructor() {
        this.storage = new Storage({
            keyFilename: path.join(process.cwd(), 'social-network-uploads-4fb82798ee46.json'),
            projectId: 'social-network-uploads'
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<{ url: string; filename: string; mimetype: string }> {
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
                    url: `https://storage.googleapis.com/${this.bucketName}/${filename}`,
                    filename,
                    mimetype: file.mimetype,
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
