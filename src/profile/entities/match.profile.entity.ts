import {
  Column,
  DataType,
  ForeignKey,
  Table,
  Model
} from "sequelize-typescript";
import { User } from "src/auth/entities/user.entity";

@Table({
  tableName: "match_profile"
})
export class MatchProfile extends Model {
  @ForeignKey(() => User)
  @Column({
    field: "user_a",
    type: DataType.UUID,
    unique: true,
    allowNull: false
  })
  declare userAId: string;

  @ForeignKey(() => User)
  @Column({
    field: "user_b",
    unique: true,
    type: DataType.UUID,
    allowNull: false
  })
  declare userBId: string;

  @Column({
    field: "status",
    type: DataType.INTEGER,
    allowNull: false
  })
  declare status: number;
}
