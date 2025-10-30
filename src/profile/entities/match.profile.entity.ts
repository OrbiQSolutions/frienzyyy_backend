import {
  Column,
  DataType,
  ForeignKey,
  Table,
  Model,
  BelongsTo
} from "sequelize-typescript";
import { User } from "../../auth/entities/user.entity";

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

  @BelongsTo(() => User, { foreignKey: 'userAId', targetKey: 'userId', as: 'userA' })
  declare userA: User;

  @ForeignKey(() => User)
  @Column({
    field: "user_b",
    unique: true,
    type: DataType.UUID,
    allowNull: false
  })
  declare userBId: string;

  @BelongsTo(() => User, { foreignKey: 'userBId', targetKey: 'userId', as: 'userB' })
  declare userB: User;

  @Column({
    field: "status",
    type: DataType.INTEGER,
    allowNull: false
  })
  declare status: number;
}
