import { Model, Column, DataType, Table, ForeignKey, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { Post } from "./posts.model";
import { User } from "./users.model";

interface PostViewsCreationAttrs {
	user_id: number;
	post_id: number;
}

@Table({ tableName: 'post_views', timestamps: false })
export class PostViews extends Model<PostViews, PostViewsCreationAttrs> {
	@PrimaryKey
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	user_id: number;

	@PrimaryKey
	@ForeignKey(() => Post)
	@Column({ type: DataType.INTEGER, allowNull: false })
	post_id: number;

	@Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
	viewed_at: Date;

	@BelongsTo(() => User, { as: 'user' })
	user: User;

	@BelongsTo(() => Post, { as: 'post' })
	post: Post;
}
