import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/models/posts.model';
import { AuthModule } from 'src/auth/auth.module';
import { PostFile } from 'src/models/postFile.model';

@Module({
	controllers: [PostsController],
	providers: [PostsService],
	imports: [
		SequelizeModule.forFeature([Post, PostFile]),
		AuthModule
	],
})
export class PostsModule { }
