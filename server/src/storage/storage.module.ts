import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Files } from 'src/models/files.model';
import { Post } from 'src/models/posts.model';

@Module({
  providers: [StorageService],
  controllers: [StorageController],
  imports: [
    SequelizeModule.forFeature([Post, Files]),
    AuthModule,
  ],
  exports: [
    StorageService
  ]
})
export class StorageModule { }
