import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostModel } from './models/post.model';

@ApiTags('posts')
@Controller('/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Save post' })
  @ApiResponse({
    status: 200,
    description: 'Posts saved',
    type: [PostModel],
  })
  @ApiResponse({
    status: 404,
    description: 'Posts not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/external')
  async savePostsToDB() {
    try {
      const posts = await this.postsService.savePostsToDB();
      return {
        postsCount: posts.length,
        posts,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to save posts. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get post' })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved',
    type: [PostModel],
  })
  @ApiResponse({
    status: 404,
    description: 'Posts not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get()
  async getPostsFromDB() {
    try {
      const posts = await this.postsService.getPostsFromDB();
      return {
        postsCount: posts.length,
        posts,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get posts. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete posts' })
  @ApiResponse({
    status: 200,
    description: 'Posts deleted',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Delete()
  async deletePostsFromDB() {
    try {
      await this.postsService.deletePostsFromDB();
      return { message: 'All posts deleted from database' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get posts. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
