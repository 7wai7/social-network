import { Model, Column, DataType, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Comment } from "./comments.model";
import { Files } from "./files.model";

interface CommentFilesCreationAttrs {
	comment_id: number;
	filename: string;
	mimetype: string;
}

@Table({ tableName: 'comment_files' })
export class CommentFiles extends Model<CommentFiles, CommentFilesCreationAttrs> {
	@ForeignKey(() => Comment)
	@Column({ type: DataType.INTEGER, allowNull: false })
	comment_id: number;

	@ForeignKey(() => Files)
	@Column({ type: DataType.INTEGER, allowNull: false })
	file_id: number;

	@BelongsTo(() => Comment, { as: 'comment' })
	comment: Comment;

	@BelongsTo(() => Files, { as: 'files' })
	files: Files;
}
