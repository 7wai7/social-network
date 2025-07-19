import { forwardRef, Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Post } from 'src/models/posts.model';
import { AuthModule } from 'src/auth/auth.module';
import { PostFile } from 'src/models/postFile.model';
import { StorageModule } from 'src/storage/storage.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [PostsController],
	providers: [PostsService],
	imports: [
		SequelizeModule.forFeature([Post, PostFile]),
		AuthModule,
		forwardRef(() => UsersModule),
		StorageModule
	],
	exports: [
		PostsService
	]
})
export class PostsModule { }
