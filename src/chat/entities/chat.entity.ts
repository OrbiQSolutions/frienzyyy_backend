import { Column, DataType, ForeignKey, Table } from "sequelize-typescript";
import { User } from "src/auth/entities/user.entity";

@Table({
  tableName: "chat_messages"
})
export class ChatMessages {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "from_user"
  })
  declare fromUser: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "to_user"
  })
  declare toUser: string;

  @Column({
    field: "message",
    type: DataType.STRING,
    allowNull: true
  })
  declare userMessage: string;

    @Column({
    field: "image_url",
    type: DataType.STRING,
    allowNull: true
  })
  declare imageUrl: string;
}
