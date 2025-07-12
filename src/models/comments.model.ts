import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany } from "sequelize-typescript";
import { User } from "./users.model";
import { CommentFile } from "./commentFiles.model";

interface CommentsCreationAttrs {
	user_id: number;
	text: string;
}

@Table({ tableName: 'comments' })
export class Comment extends Model<Comment, CommentsCreationAttrs> {
  	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	user_id: number;

	@BelongsTo(() => User, { as: 'user' })
	user: User;

	@Column({ type: DataType.STRING, allowNull: true })
	text: string;
	
	@HasMany(() => CommentFile, { as: 'files' })
	files: CommentFile[];
}