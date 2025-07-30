import { Model, Column, DataType, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Post } from "./posts.model";
import { Files } from "./files.model";

interface PostFilesCreationAttrs {
	post_id: number;
	file_id: number;
}

@Table({ tableName: 'post_files' })
export class PostFiles extends Model<PostFiles, PostFilesCreationAttrs> {
	@ForeignKey(() => Post)
	@Column({ type: DataType.INTEGER, allowNull: false })
	post_id: number;

	@ForeignKey(() => Files)
	@Column({ type: DataType.INTEGER, allowNull: false })
	file_id: number;

	@BelongsTo(() => Post, { as: 'post' })
	post: Post;

	@BelongsTo(() => Files, { as: 'files' })
	files: Files;
}
