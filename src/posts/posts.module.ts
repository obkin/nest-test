import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostModel } from './models/post.model';
import { HttpModule } from '@nestjs/axios';
import { PostsRepository } from './posts.repository';

@Module({
  imports: [SequelizeModule.forFeature([PostModel]), HttpModule],
  providers: [PostsService, PostsRepository],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
