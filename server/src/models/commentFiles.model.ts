import { Model, Column, DataType, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Comment } from "./comments.model";

interface CommentFilesCreationAttrs {
	comment_id: number;
	filename: string;
	mimetype: string;
}

@Table({ tableName: 'comment_files' })
export class CommentFile extends Model<CommentFile, CommentFilesCreationAttrs> {
	@ForeignKey(() => Comment)
	@Column({ type: DataType.INTEGER, allowNull: false })
	comment_id: number;

	@BelongsTo(() => Comment, { as: 'comment' })
	comment: Comment;

	@Column({ type: DataType.STRING, allowNull: false })
	filename: string;

	@Column({ type: DataType.STRING, allowNull: false }) // наприклад, "image/jpeg"
	mimetype: string;
}
