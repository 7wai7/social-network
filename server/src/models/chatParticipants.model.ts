import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "./users.model";
import { Chat } from "./chat.model";

interface ChatParticipantsCreationAttrs {
    user_id: number,
    chat_id: number
}

@Table({ tableName: 'chat_participants' })
export class ChatParticipants extends Model<ChatParticipants, ChatParticipantsCreationAttrs> {
    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    user_id: number;

    @ForeignKey(() => Chat)
    @Column({ type: DataType.INTEGER, allowNull: false })
    chat_id: number;

    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => Chat, { as: 'chat' })
    chat: Chat;
}
