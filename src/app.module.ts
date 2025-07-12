import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { User } from './models/users.model';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { Post } from './models/posts.model';
import { PostFile } from './models/postFile.model';
import { Follow } from './models/follow.model';
import { CommentsModule } from './comments/comments.module';
import * as dotenv from 'dotenv';
dotenv.config();


@Module({
	controllers: [AppController],
	providers: [AppService],
	imports: [
		SequelizeModule.forRoot({
			dialect: 'postgres',
			host: process.env.POSTGRES_HOST,
			port: Number(process.env.POSTGRES_PORT),
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			models: [Follow, User, Post, PostFile],
			autoLoadModels: true,
			synchronize: true,
		}),
		UsersModule,
		AuthModule,
		PostsModule,
		CommentsModule,
	],
})
export class AppModule { }
