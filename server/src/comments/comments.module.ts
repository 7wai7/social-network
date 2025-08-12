import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from 'src/models/comments.model';
import { CommentFiles } from 'src/models/commentFiles.model';
import { AuthModule } from 'src/auth/auth.module';
import { Files } from 'src/models/files.model';
import { Post } from 'src/models/posts.model';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [
    SequelizeModule.forFeature([Comment, CommentFiles, Files, Post]),
    forwardRef(() => AuthModule),
    StorageModule
  ]
})
export class CommentsModule { }
