import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  Index,
  CreatedAt,
  Sequelize,
} from 'sequelize-typescript';

@Table({ tableName: 'access_tokens' })
export class AccessTokenModel extends Model<AccessTokenModel> {
  @ApiProperty({
    example: 129,
    description: 'The unique identifier of the access token',
  })
  @PrimaryKey
  @AutoIncrement
  @Column
  public id: number;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The unique access token string',
  })
  @Index({ unique: true })
  @Column
  public accessToken: string;

  @ApiProperty({
    example: 123,
    description: 'User ID associated with the access token',
  })
  @Column
  public userId: number;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: 'Expiration date of the access token',
  })
  @Column({ type: 'timestamp' })
  public expiresIn: Date;

  @ApiProperty({
    example: '2024-07-02T15:30:00Z',
    description: 'The date and time when the access token was created',
  })
  @CreatedAt
  @Column({ type: 'timestamp', defaultValue: Sequelize.fn('NOW') })
  public createdAt: Date;
}
