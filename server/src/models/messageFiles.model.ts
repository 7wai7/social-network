import { Model, Column, DataType, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Files } from "./files.model";
import { Messages } from "./messages.model";

interface MessageFilesCreationAttrs {
	message_id: number;
	file_id: number;
}

@Table({ tableName: 'message_files' })
export class MessageFiles extends Model<MessageFiles, MessageFilesCreationAttrs> {
  	@ForeignKey(() => Messages)
	@Column({ type: DataType.INTEGER, allowNull: false })
	message_id: number;
	
  	@ForeignKey(() => Files)
	@Column({ type: DataType.INTEGER, allowNull: false })
	file_id: number;

	@BelongsTo(() => Messages, { as: 'message' })
	message: Messages;

	@BelongsTo(() => Files, { as: 'files' })
	files: Files;
}