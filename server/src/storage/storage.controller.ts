import { Body, Controller, HttpException, HttpStatus, Param, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { HttpExceptionCode } from 'src/exceptions/HttpExceptionCode';
import { JwtAuthGuard } from 'src/auth/jwt-auth.quard';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFileDto } from 'src/dto/create-file.dto';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }


    @ApiOperation({
        summary: 'Завантаження файлів на Google Cloud Storage',
        description: 'Завантажує файли на Google Cloud Storage та може видалити попередні файли за вказаними URL'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Файли для завантаження та URL файлів для видалення',
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary'
                    },
                    description: 'Файли для завантаження'
                },
                filesToDeleteUrls: {
                    type: 'string',
                    description: 'JSON рядок з масивом URL файлів для видалення',
                    example: ["https://storage.googleapis.com/bucket/1a6fde06-9b92-4065-9c00-a713bdff8f7d.txt", "https://storage.googleapis.com/bucket/7bbbed7c-fdb8-41db-a704-c3b4d42c6b58.png"]
                }
            },
            required: ['files']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Файли успішно завантажені',
        type: [CreateFileDto]
    })
    @ApiResponse({
        status: 400,
        description: 'Забагато файлів',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: 'Too many files' }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Користувач не авторизований',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' }
            }
        }
    })
    @ApiResponse({
        status: 413,
        description: 'Файл занадто великий',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 413 },
                message: { type: 'string', example: 'File too large' }
            }
        }
    })
    @ApiResponse({
        status: 500,
        description: 'Помилка сервера при завантаженні файлів',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 500 },
                message: { type: 'string', example: 'Error uploading files' }
            }
        }
    })
    @ApiCookieAuth('token')
    @Post("/upload")
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async upload(@Body() body: { filesToDeleteUrls?: string, }, @UploadedFiles() files: Array<Express.Multer.File>) {
        if (body.filesToDeleteUrls) {
            const filesToDeleteUrls = JSON.parse(body.filesToDeleteUrls);
            if (body.filesToDeleteUrls.length) await this.storageService.deleteFilesByUrls(filesToDeleteUrls);
        }
        return await this.storageService.uploadFiles(files);
    }

    // @Post()
    // @UseInterceptors(FileInterceptor('file'))
    // async upload(@UploadedFile() file: Express.Multer.File) {
    //     const url = await this.storageService.uploadFile(file);
    //     return { url };
    // }
}
