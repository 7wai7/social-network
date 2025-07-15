import { Model, Column, DataType, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany } from "sequelize-typescript";
import { ChatMessages } from "./chatMessages.model";

interface ChatMessageFilesCreationAttrs {
	message_id: number;
	filename: string;
	mimetype: string;
}

@Table({ tableName: 'chat_message_files' })
export class ChatMessageFiles extends Model<ChatMessageFiles, ChatMessageFilesCreationAttrs> {
  	@ForeignKey(() => ChatMessages)
	@Column({ type: DataType.INTEGER, allowNull: false })
	message_id: number;

	@Column({ type: DataType.STRING, allowNull: false })
	filename: string;

	@Column({ type: DataType.STRING, allowNull: false }) // наприклад, "image/jpeg"
	mimetype: string;


	@BelongsTo(() => ChatMessages, { as: 'message' })
	message: ChatMessages;
}