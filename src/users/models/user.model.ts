import { Column, Model, Table, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table
export class UserModel extends Model<UserModel> {
  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  public email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: [6, 255],
    },
  })
  public password: string;
}
