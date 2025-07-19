import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: Express.Multer.File) {
        const url = await this.storageService.uploadFile(file);
        return { url };
    }
}
