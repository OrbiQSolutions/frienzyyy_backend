import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import { User } from "./user.entity";

@Table({ tableName: "address" })
export class Address extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
    allowNull: true
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    field: 'pincode',
    allowNull: true
  })
  declare pincode: string;

  @BelongsTo(
    () => User,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  )
  declare user: User;
}