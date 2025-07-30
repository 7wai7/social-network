import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany } from "sequelize-typescript";
import { User } from "./users.model";
import { Chat } from "./chat.model";
import { Files } from "./files.model";
import { MessageFiles } from "./messageFiles.model";

interface MessagesCreationAttrs {
	user_id: number; // власник повідомлення
	chat_id: number // чат де надіслано повідомлення
	text: string;
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


	@BelongsTo(() => User, { as: 'user' })
	user: User;

	@BelongsTo(() => Chat, { as: 'chat' })
	chat: Chat;

	@BelongsToMany(() => Files, () => MessageFiles)
	files: Files[];
}