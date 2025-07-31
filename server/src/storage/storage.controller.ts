import { Body, Controller, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post("/upload")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async upload(@Body() body: { filesToDeleteUrls: string, }, @UploadedFiles() files: Array<Express.Multer.File>) {
        const filesToDeleteUrls = JSON.parse(body.filesToDeleteUrls);
        
        if (body.filesToDeleteUrls.length) await this.storageService.deleteFilesByUrls(filesToDeleteUrls);
        return await this.storageService.uploadFiles(files);
    }

    // @Post()
    // @UseInterceptors(FileInterceptor('file'))
    // async upload(@UploadedFile() file: Express.Multer.File) {
    //     const url = await this.storageService.uploadFile(file);
    //     return { url };
    // }
}
