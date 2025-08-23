import { Model, Column, DataType, Table, ForeignKey, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { Post } from "./posts.model";
import { Tags } from "./tags.model";

interface PostTagsCreationAttrs {
	post_id: number;
	tag_id: number;
}

@Table({ tableName: 'post_tags', timestamps: false })
export class PostTags extends Model<PostTags, PostTagsCreationAttrs> {
	@PrimaryKey
	@ForeignKey(() => Post)
	@Column({ type: DataType.INTEGER, allowNull: false })
	post_id: number;

	@PrimaryKey
	@ForeignKey(() => Tags)
	@Column({ type: DataType.INTEGER, allowNull: false })
	tag_id: number;

	@BelongsTo(() => Post, { as: 'post' })
	post: Post;

	@BelongsTo(() => Tags, { as: 'tags' })
	tags: Tags;
}
