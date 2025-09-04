import {
  Table,
  Column,
  Model,
  DataType
} from 'sequelize-typescript';

@Table({ tableName: 'users_profile' })
export class UserProfile extends Model {
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
}