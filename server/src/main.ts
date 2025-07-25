import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { HttpException, HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
dotenv.config();


function formatErrors(errors: ValidationError[]): { field: string; messages: string[] }[] {
	const result: { field: string, messages: string[] }[] = [];

	for (const err of errors) {
		if (err.constraints) {
			result.push({
				field: err.property,
				messages: Object.values(err.constraints)
			});
		}
		if (err.children?.length) {
			const child = formatErrors(err.children);
			result.push(...child);
		}
	}

	return result;
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.setGlobalPrefix('/api');
	app.enableCors({
		origin: 'http://localhost:5173',
		credentials: true,
	});
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,        // видалити зайві поля
		forbidNonWhitelisted: true, // кидати помилку при зайвих полях
		transform: true,          // автоматично трансформувати до типів DTO
		exceptionFactory: (errors: ValidationError[]) => {
			console.log("errors", errors);

			const formatted = formatErrors(errors).map(item => ({
				field: item.field,
				message: item.messages.join(', '),
				code: item.field.toUpperCase() + '_INVALID'
			}));
			throw new HttpException({ errors: formatted }, HttpStatus.BAD_REQUEST);
		}
	}));

	await app.listen(process.env.PORT ?? 3000, () => {
		console.log("Server started")
	});
}
bootstrap();
