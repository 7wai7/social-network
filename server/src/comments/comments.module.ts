import { forwardRef, Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from 'src/models/comments.model';
import { CommentFile } from 'src/models/commentFiles.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [
    SequelizeModule.forFeature([Comment, CommentFile]),
    forwardRef(() => AuthModule)
  ]
})
export class CommentsModule { }
