import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import { User } from "src/auth/entities/user.entity";

@Table({
  tableName: "chat_list"
})
export class ChatList extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  declare userId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'chat_user_id'
  })
  declare chatUserId: string;

  @BelongsTo(() => User, { foreignKey: 'chatUserId', targetKey: 'userId', as: 'user' })
  declare user: User;
}