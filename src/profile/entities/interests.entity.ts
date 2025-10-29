import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";

@Table({
  tableName: "interests"
})
export class Interests extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    field: "interest_id",
    allowNull: false
  })
  declare interestId: string;

  @Column({
    type: DataType.STRING,
    field: "interest_name",
    allowNull: false
  })
  declare interestName: string;

  @Column({
    type: DataType.STRING,
    field: "image_url",
    allowNull: true
  })
  declare imageUrl: string;
}