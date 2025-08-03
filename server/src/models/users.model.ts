import { Model, Column, DataType, Table, BelongsToMany, HasMany } from "sequelize-typescript";
import { Follow } from "./follow.model";
import { Post } from "./posts.model";
import { Chat } from "./chat.model";
import { ChatParticipants } from "./chatParticipants.model";
import { ApiProperty } from "@nestjs/swagger";

interface UserCreationAttrs {
	login: string;
	email: string;
	password: string;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {

	@ApiProperty({
		example: 'john_doe',
		description: 'Унікальний логін користувача',
		minLength: 3,
		maxLength: 16
	})
	@Column({ type: DataType.STRING, unique: true, allowNull: false })
	login: string;


	@ApiProperty({
		example: 'john.doe@gmail.com',
		description: 'Унікальна електронна пошта користувача',
		format: 'email'
	})
	@Column({ type: DataType.STRING, unique: true, allowNull: false })
	email: string;


	@ApiProperty({
		example: 'SecurePassword123!',
		description: 'Хешований пароль користувача',
		minLength: 3,
		maxLength: 100,
		writeOnly: true
	})
	@Column({ type: DataType.STRING, allowNull: false })
	password: string;





	// Ті, кого Я фоловлю
	@ApiProperty({
		description: 'Список користувачів, на яких підписаний поточний користувач',
		type: () => [User],
		required: false
	})
	@BelongsToMany(() => User, () => Follow, 'follower_id', 'following_id')
	following: User[];

	// Ті, хто фоловлять Мене
	@ApiProperty({
		description: 'Список користувачів, які підписані на поточного користувача',
		type: () => [User],
		required: false
	})
	@BelongsToMany(() => User, () => Follow, 'following_id', 'follower_id')
	followers: User[];


	@ApiProperty({
		description: 'Список постів, створених користувачем',
		type: () => [Post],
		required: false
	})
	@HasMany(() => Post, { as: 'posts' })
	posts: Post[];

	@ApiProperty({
		description: 'Список чатів, в яких бере участь користувач',
		type: () => [Chat],
		required: false
	})
	@BelongsToMany(() => Chat, () => ChatParticipants, 'user_id', 'chat_id')
	chats: Chat[];
}