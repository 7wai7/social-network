import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany } from "sequelize-typescript";
import { User } from "./users.model";
import { Files } from "./files.model";
import { PostFiles } from "./postFiles.model";

interface PostsCreationAttrs {
	user_id: number;
	text: string;
}

@Table({ tableName: 'posts' })
export class Post extends Model<Post, PostsCreationAttrs> {
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	user_id: number;

	@BelongsTo(() => User, { as: 'user' })
	user: User;

	@Column({ type: DataType.STRING, allowNull: true })
	text: string;

	@BelongsToMany(() => Files, () => PostFiles)
	files: Files[];
}