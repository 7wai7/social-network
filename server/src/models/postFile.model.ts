import { Model, Column, DataType, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Post } from "./posts.model";

interface PostFileCreationAttrs {
	post_id: number;
	originalname: string;
	filename: string;
	mimetype: string;
	url: string;
}

@Table({ tableName: 'post_files' })
export class PostFile extends Model<PostFile, PostFileCreationAttrs> {
	@ForeignKey(() => Post)
	@Column({ type: DataType.INTEGER, allowNull: false })
	post_id: number;

	@BelongsTo(() => Post, { as: 'post' })
	post: Post;

	@Column({ type: DataType.STRING, allowNull: false })
	originalname: string;

	@Column({ type: DataType.STRING, allowNull: false })
	filename: string;

	@Column({ type: DataType.STRING, allowNull: false }) // наприклад, "image/jpeg"
	mimetype: string;

	@Column({ type: DataType.STRING, allowNull: false })
	url: string;
}
