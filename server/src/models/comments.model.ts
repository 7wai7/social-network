import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany, Sequelize } from "sequelize-typescript";
import { User } from "./users.model";
import { CommentFiles } from "./commentFiles.model";
import { Post } from "./posts.model";
import { Files } from "./files.model";

interface CommentCreationAttrs {
	user_id: number;
	post_id: number;
	text?: string;
}

@Table({ tableName: 'comments' })
export class Comment extends Model<Comment, CommentCreationAttrs> {
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	user_id: number;

	@ForeignKey(() => Post)
	@Column({ type: DataType.INTEGER, allowNull: false })
	post_id: number;

	@Column({ type: DataType.STRING, allowNull: true })
	text: string;


	@Column({ type: DataType.VIRTUAL })
	isOwnComment: boolean;

	// Scope для автоматичного підрахунку isOwnComment
	static withOwnership(currentUserId: number) {
		return {
			attributes: {
				include: [
					[
						Sequelize.literal(`CASE WHEN "Comment"."user_id" = ${currentUserId} THEN true ELSE false END`),
						'isOwnComment'
					]
				]
			}
		};
	}

	@BelongsTo(() => User, { as: 'user' })
	user: User;

	@BelongsTo(() => Post, { as: 'post' })
	post: Post;

	@BelongsToMany(() => Files, () => CommentFiles)
	files: Files[];
}