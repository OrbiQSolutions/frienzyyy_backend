import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import { User } from "src/auth/entities/user.entity";

@Table({
  tableName: "chat_messages"
})
export class ChatMessages extends Model {
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
    field: "text_message",
    type: DataType.STRING,
    allowNull: true
  })
  declare textMessage: string;

  @Column({
    field: "image_url",
    type: DataType.STRING,
    allowNull: true
  })
  declare imageUrl: string;
}
