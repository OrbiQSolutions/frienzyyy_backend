import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ tableName: 'auth_log' })
export class AuthLog extends Model {
  @ForeignKey(() => User)
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    field: "device_os"
  })
  declare deviceOS: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'token',
  })
  declare token: string;

  @BelongsTo(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare user: User;
}