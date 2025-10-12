import {
  Column,
  DataType,
  ForeignKey,
  Model
} from "sequelize-typescript";
import { User } from "src/auth/entities/user.entity";

export class ChatList extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  declare userId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  declare chatUserId: string;
}