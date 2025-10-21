import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { User } from "../../auth/entities/user.entity";

@Table({ tableName: "user_address" })
export class Address extends Model {
  @ForeignKey(() => User)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    field: 'user_id',
    unique: true,
    allowNull: true
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    field: 'city_name',
    allowNull: true
  })
  declare cityName: string;

  @Column({
    type: DataType.STRING,
    field: 'country_name',
    allowNull: true
  })
  declare countryName: string;

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