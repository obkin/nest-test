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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forFeature([AccessTokenModel, RefreshTokenModel]),
    ConfigModule,
  ],
  providers: [AuthService, RefreshTokenRepository, AccessTokenRepository],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
