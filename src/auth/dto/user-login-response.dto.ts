import { ApiProperty } from '@nestjs/swagger';

export class UserLoginResponseDto {
  @ApiProperty({ example: 123 })
  readonly id: number;

  @ApiProperty({ example: 'john_dope@gmail.com' })
  readonly email: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpDFJD3...',
  })
  readonly refreshToken: string;
}
