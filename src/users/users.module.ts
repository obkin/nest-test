import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { ConfigModule } from '@nestjs/config';
import { UsersRepository } from './users.repository';

@Module({
  imports: [SequelizeModule.forFeature([User]), ConfigModule],
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
