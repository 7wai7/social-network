import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/models/users.model';
import { AuthModule } from 'src/auth/auth.module';
import { Follow } from 'src/models/follow.model';
import { PostsModule } from 'src/posts/posts.module';

@Module({
	providers: [UsersService],
	controllers: [UsersController],
	imports: [
		SequelizeModule.forFeature([Follow, User]),
		forwardRef(() => AuthModule),
		forwardRef(() => PostsModule),
	],
	exports: [
		UsersService,
	]
})
export class UsersModule { }
