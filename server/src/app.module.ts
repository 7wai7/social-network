import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { User } from './models/users.model';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { Post } from './models/posts.model';
import { PostFiles } from './models/postFiles.model';
import { Follow } from './models/follow.model';
import { CommentsModule } from './comments/comments.module';
import * as dotenv from 'dotenv';
import { Comment } from './models/comments.model';
import { CommentFiles } from './models/commentFiles.model';
import { ChatModule } from './chat/chat.module';
import { ChatParticipants } from './models/chatParticipants.model';
import { Chat } from './models/chat.model';
import { ServeStaticModule } from '@nestjs/serve-static';
import { StorageModule } from './storage/storage.module';
import * as path from 'path';
import { Files } from './models/files.model';
import { Messages } from './models/messages.model';
import { MessageFiles } from './models/messageFiles.model';
import { PostViews } from './models/postViews.model';
import { PostTags } from './models/postTags.model';
import { Tags } from './models/tags.model';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
dotenv.config();


@Module({
	controllers: [AppController],
	providers: [AppService],
	imports: [
		ServeStaticModule.forRoot({
			rootPath: path.join(process.cwd(), 'data')
		}),
		SequelizeModule.forRoot({
			dialect: 'postgres',
			dialectOptions: {
				charset: 'utf8',
			},
			define: {
				charset: 'utf8',
				collate: 'utf8_general_ci', // для MySQL (ігнорується в PostgreSQL)
			},
			host: process.env.POSTGRES_HOST,
			port: Number(process.env.POSTGRES_PORT),
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			models: [
				Follow,
				User,
				Post,
				PostFiles,
				Comment,
				CommentFiles,
				Chat,
				ChatParticipants,
				Messages,
				MessageFiles,
				Files,
				PostViews,
				PostTags,
				Tags
			],
			autoLoadModels: true,
			synchronize: true,
			logging: false
		}),
		// CacheModule.registerAsync({
		// 	isGlobal: true, // щоб не треба було імпортувати в кожному модулі
		// 	useFactory: async () => ({
		// 		store: await redisStore({
		// 			url: 'redis://localhost:6379',
		// 			ttl: 60 * 15, // за замовчуванням 15 хв кеш
		// 		}),
		// 	}),
		// }),
		CacheModule.register({
			isGlobal: true,
			ttl: 1000 * 60 * 15,
		}),
		UsersModule,
		AuthModule,
		PostsModule,
		CommentsModule,
		ChatModule,
		StorageModule
	],
})
export class AppModule { }
