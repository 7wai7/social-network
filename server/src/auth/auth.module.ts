import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [
		forwardRef(() => UsersModule),
		JwtModule.register({
			secret: process.env.TOKEN_KEY || 'SECRET',
			signOptions: {
				expiresIn: '24h'
			}
    	})
	],
	exports: [
		AuthService,
		JwtModule
	]
})
export class AuthModule { }
