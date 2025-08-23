import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany, Sequelize } from "sequelize-typescript";
import { User } from "./users.model";
import { Files } from "./files.model";
import { PostFiles } from "./postFiles.model";
import { Tags } from "./tags.model";
import { PostTags } from "./postTags.model";
import { PostViews } from "./postViews.model";
import { CreationOptional } from "sequelize";

export interface PostsCreationAttrs {
    user_id: number;
    text: string;
}

@Table({ tableName: 'posts', timestamps: true, updatedAt: false })
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

    @BelongsToMany(() => Tags, () => PostTags)
    tags: Tags[];

    @HasMany(() => PostViews, { as: 'views' })
    views: PostViews[];

}

function CreateDateColumn(): (target: Post, propertyKey: "createdAt") => void {
    throw new Error("Function not implemented.");
}
