import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  HasOne,
} from 'sequelize-typescript';
import { UserProfile } from './user.profile.entity';

@Table({ tableName: 'users' })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    unique: true,
    type: DataType.UUID,
    field: 'user_id',
  })
  declare userId: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare password: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    field: 'is_verified',
  })
  declare isVerified: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'user_otp'
  })
  declare otp: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'reset_password_token',
  })
  declare resetPasswordToken: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'reset_password_expires',
  })
  declare resetPasswordExpires: Date | null;

  @HasOne(() => UserProfile)
  declare profile: UserProfile;
}
