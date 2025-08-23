import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany } from "sequelize-typescript";
import { Post } from "./posts.model";
import { PostTags } from "./postTags.model";

interface TagsCreationAttrs {
	name: string;
}

@Table({ tableName: 'tags', timestamps: false })
export class Tags extends Model<Tags, TagsCreationAttrs> {
	@Column({ type: DataType.TEXT, allowNull: false })
	name: string;

	@BelongsToMany(() => Post, () => PostTags)
	posts: Post[];
}
