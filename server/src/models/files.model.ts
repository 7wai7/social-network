import { Model, Column, DataType, Table, ForeignKey, BelongsTo } from "sequelize-typescript";

interface FilesCreationAttrs {
	originalname: string;
	mimetype: string;
	size: number;
	url: string;
}

@Table({ tableName: 'files' })
export class Files extends Model<Files, FilesCreationAttrs> {
	@Column({ type: DataType.STRING, allowNull: false })
	originalname: string;

	@Column({ type: DataType.STRING, allowNull: false }) // наприклад, "image/jpeg"
	mimetype: string;

	@Column({ type: DataType.INTEGER, allowNull: false })
	size: number;

	@Column({ type: DataType.STRING, allowNull: false })
	url: string;
}
