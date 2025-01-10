import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from './auth.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { AccessTokenModel } from './models/access-token.model';
import { RefreshTokenModel } from './models/refresh-token.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([AccessTokenModel, RefreshTokenModel]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    RefreshTokenRepository,
    AccessTokenRepository,
    ConfigService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
