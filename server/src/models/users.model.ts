import { Model, Column, DataType, Table, BelongsToMany, HasMany } from "sequelize-typescript";
import { Follow } from "./follow.model";
import { Post } from "./posts.model";

interface UserCreationAttrs {
	login: string;
	email: string;
	password: string;
}
console.log('Follow exists?', Follow);

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
	@Column({ type: DataType.STRING, unique: true, allowNull: false })
	login: string;

	@Column({ type: DataType.STRING, unique: true, allowNull: false })
	email: string;

	@Column({ type: DataType.STRING, allowNull: false })
	password: string;

	// Ті, кого Я фоловлю
	@BelongsToMany(() => User, () => Follow, 'follower_id', 'following_id')
	following: User[];

	// Ті, хто фоловлять Мене
	@BelongsToMany(() => User, () => Follow, 'following_id', 'follower_id')
	followers: User[];
		
	@HasMany(() => Post, { as: 'posts' })
	posts: Post[];
}