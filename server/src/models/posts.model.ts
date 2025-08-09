import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany, Sequelize } from "sequelize-typescript";
import { User } from "./users.model";
import { Files } from "./files.model";
import { PostFiles } from "./postFiles.model";

export interface PostsCreationAttrs {
	user_id: number;
	text: string;
}

@Table({ tableName: 'posts' })
export class Post extends Model<Post, PostsCreationAttrs> {
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	user_id: number;

	@Column({ type: DataType.STRING, allowNull: true })
	text: string;


    @Column({ type: DataType.VIRTUAL })
    isOwnPost: boolean;

    // Scope для автоматичного підрахунку isOwnPost
    static withOwnership(currentUserId: number) {
        return {
            attributes: {
                include: [
                    [
                        // SQL: CASE WHEN posts.user_id = currentUserId THEN true ELSE false END
                        Sequelize.literal(`CASE WHEN "Post"."user_id" = ${currentUserId} THEN true ELSE false END`),
                        'isOwnPost'
                    ]
                ]
            }
        };
    }


	@BelongsToMany(() => Files, () => PostFiles)
	files: Files[];

	@BelongsTo(() => User, { as: 'user' })
	user: User;
}