import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
  })
  lastName?: string;

  @Column({
    type: DataType.ENUM('male', 'female', 'other'),
  })
  gender?: 'male' | 'female' | 'other';

  @Column({
    type: DataType.DATEONLY,
  })
  dateOfBirth?: Date;

  @Column(DataType.STRING)
  profilePicture?: string;

  @Column(DataType.TEXT)
  bio?: string;

  @Column(DataType.STRING)
  location?: string;

  @Column(DataType.JSON)
  interests?: string[];

  @Default(false)
  @Column(DataType.BOOLEAN)
  isVerified?: boolean;

  @Column(DataType.STRING)
  verificationCode?: string;

  @Column(DataType.STRING)
  resetPasswordToken?: string;

  @Column(DataType.DATE)
  resetPasswordExpires?: Date;
}
