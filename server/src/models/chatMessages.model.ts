import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany } from "sequelize-typescript";
import { User } from "./users.model";
import { ChatMessageFiles } from "./chatMessageFiles.model";
import { Chat } from "./chat.model";

interface ChatMessagesCreationAttrs {
	user_id: number; // власник повідомлення
	chat_id: number // чат де надіслано повідомлення
	text: string;
}

@Table({ tableName: 'chat_messages' })
export class ChatMessages extends Model<ChatMessages, ChatMessagesCreationAttrs> {
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
	
	@HasMany(() => ChatMessageFiles, { as: 'files' })
	files: ChatMessageFiles[];
}