import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany } from "sequelize-typescript";
import { User } from "./users.model";
import { CommentFile } from "./commentFiles.model";
import { Post } from "./posts.model";

interface CommentCreationAttrs {
	user_id: number;
	post_id: number;
	text: string;
}

@Table({ tableName: 'comments' })
export class Comment extends Model<Comment, CommentCreationAttrs> {
  	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	user_id: number;

	@BelongsTo(() => User, { as: 'user' })
	user: User;

  	@ForeignKey(() => Post)
	@Column({ type: DataType.INTEGER, allowNull: false })
	post_id: number;

	@BelongsTo(() => Post, { as: 'post' })
	post: Post;

	@Column({ type: DataType.STRING, allowNull: true })
	text: string;
	
	@HasMany(() => CommentFile, { as: 'files' })
	files: CommentFile[];
}