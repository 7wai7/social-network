import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany, Sequelize } from "sequelize-typescript";
import { User } from "./users.model";
import { Chat } from "./chat.model";
import { Files } from "./files.model";
import { MessageFiles } from "./messageFiles.model";

export interface MessagesCreationAttrs {
	user_id: number; // власник повідомлення
	chat_id: number // чат де надіслано повідомлення
	text?: string;
}

@Table({ tableName: 'messages' })
export class Messages extends Model<Messages, MessagesCreationAttrs> {
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER, allowNull: false })
	user_id: number;

	@ForeignKey(() => Chat)
	@Column({ type: DataType.INTEGER, allowNull: false })
	chat_id: number;

	@Column({ type: DataType.TEXT, allowNull: true })
	text: string;



	@Column({ type: DataType.VIRTUAL })
	isOwnMessage: boolean;

	// Scope для автоматичного підрахунку isOwnMessage
	static withOwnership(currentUserId: number) {
		return {
			attributes: {
				include: [
					[
						// SQL: CASE WHEN posts.user_id = currentUserId THEN true ELSE false END
						Sequelize.literal(`CASE WHEN "Messages"."user_id" = ${currentUserId} THEN true ELSE false END`),
						'isOwnMessage'
					]
				]
			}
		};
	}

	@BelongsTo(() => User, { as: 'user' })
	user: User;

	@BelongsTo(() => Chat, { as: 'chat' })
	chat: Chat;

	@BelongsToMany(() => Files, () => MessageFiles)
	files: Files[];
}