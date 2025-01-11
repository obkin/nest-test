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
  @Get('/save-posts')
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
  @Get('/get-posts')
  async getPostsFromDB() {
    try {
      return await this.postsService.getPostsFromDB();
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
  @Delete('/delete-posts')
  async deletePostsFromDB() {
    try {
      return this.postsService.deletePostsFromDB();
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
