import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    example: 123,
    description: 'User ID associated with the refresh token',
  })
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token string',
  })
  @IsNotEmpty()
  @IsString()
  readonly refreshToken: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: 'Expiration date of the refresh token',
  })
  @IsNotEmpty()
  @IsDateString()
  readonly expiresIn: Date;
}
