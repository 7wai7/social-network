import { Model, Column, DataType, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./users.model";

interface FollowCreationAttrs {
	follower_id: number;
	following_id: number;
}

@Table({
	tableName: 'follow',
	indexes: [
		{
			unique: true,
			fields: ['follower_id', 'following_id'],
		},
	]
})
export class Follow extends Model<Follow, FollowCreationAttrs> {
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	follower_id: number; // той, хто підписується

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	following_id: number; // той, на кого підписуються

    @BelongsTo(() => User, { as: 'follower' })
	follower: User;

    @BelongsTo(() => User, { as: 'following' })
	following: User;
}
