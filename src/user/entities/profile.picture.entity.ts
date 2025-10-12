import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { User } from '../../auth/entities/user.entity';

@Table({ tableName: 'profile_picture' })
export class ProfilePicture extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'profile_image'
  })
  declare profileImage: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'profile_image_height'
  })
  declare profileHeight: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'profile_image_width'
  })
  declare profileWidth: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'profile_image_format'
  })
  declare profileFormat: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'profile_image_size'
  })
  declare profileSize: number;

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    field: 'additional_images'
  })
  declare additionalImages: string[];


  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: true,
    field: 'additional_image_heights'
  })
  declare imageHeights: number[];

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: true,
    field: 'additional_image_widths'
  })
  declare imageWidths: number[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    field: 'additional_image_formats'
  })
  declare imageFormat: string[];

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: true,
    field: 'additional_image_size'
  })
  declare imageSize: number[];

  @BelongsTo(
    () => User,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  )
  declare user: User;
}