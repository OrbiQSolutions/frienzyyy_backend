import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import { User } from "./user.entity";
import { Interests } from "src/profile/entities/interests.entity";

@Table({ tableName: 'user_interests' })
export class UserInterests extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  declare userId: string;

  @ForeignKey(() => Interests)
  @Column({
    type: DataType.UUID
  })
  declare interestId: string;
}