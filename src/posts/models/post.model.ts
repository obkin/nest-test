import { Column, Model, Table, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table
export class PostModel extends Model<PostModel> {
  @ApiProperty({
    description: 'The ID of the post',
    example: 1,
  })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  public id: number;

  @ApiProperty({
    description: 'The ID of the user who created the post',
    example: 1,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  public userId: number;

  @ApiProperty({
    description: 'The title of the post',
    example: 'My First Post',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  public title: string;

  @ApiProperty({
    description: 'The content of the post',
    example: 'This is the content of the post.',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  public body: string;
}
