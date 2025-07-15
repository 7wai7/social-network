import { BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { User } from "./users.model";
import { ChatMessages } from "./chatMessages.model";
import { ChatParticipants } from "./chatParticipants.model";

interface ChatCreationAttrs {
    isGroup: boolean;
    title?: string;
}

@Table({ tableName: 'chats' })
export class Chat extends Model<Chat, ChatCreationAttrs> {
    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    isGroup: boolean;

    @Column({ type: DataType.STRING, allowNull: true })
    title: string; // для групових чатів

    @BelongsToMany(() => User, () => ChatParticipants)
    participants: User[];

    @HasMany(() => ChatMessages)
    messages: ChatMessages[];
}
