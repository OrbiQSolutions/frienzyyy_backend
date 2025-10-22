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

@Table({ tableName: 'users_profile' })
export class UserProfile extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    field: 'full_name',
    type: DataType.STRING,
    allowNull: false
  })
  declare fullName?: string;

  @Default('other')
  @Column({
    type: DataType.ENUM('male', 'female', 'other'),
    allowNull: false,
  })
  declare gender?: 'male' | 'female' | 'other';

  @Column({
    type: DataType.DATEONLY,
    field: 'date_of_birth'
  })
  declare dateOfBirth?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare bio?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'location'
  })
  declare location?: string;

  @Column({
    type: DataType.ENUM('relation', 'casual', 'not_sure', 'not_say'),
    allowNull: true,
    field: 'dating_intent'
  })
  declare datingIntent?: string;

  @BelongsTo(
    () => User,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  )
  declare user: User;
}