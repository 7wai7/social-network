import { forwardRef, Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/models/posts.model';
import { AuthModule } from 'src/auth/auth.module';
import { PostFiles } from 'src/models/postFiles.model';
import { StorageModule } from 'src/storage/storage.module';
import { UsersModule } from 'src/users/users.module';
import { Files } from 'src/models/files.model';
import { User } from 'src/models/users.model';
import { Tags } from 'src/models/tags.model';

@Module({
	controllers: [PostsController],
	providers: [PostsService],
	imports: [
		SequelizeModule.forFeature([User, Post, Tags, PostFiles, Files]),
		AuthModule,
		StorageModule
	],
	exports: [
		PostsService
	]
})
export class PostsModule { }
