import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PostModel } from './models/post.model';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private readonly httpService: HttpService) {}

  async savePostsToDB() {
    const response = await lastValueFrom(
      this.httpService.get('https://jsonplaceholder.typicode.com/posts'),
    );
    const posts = response.data.slice(0, 10); // only 10 posts
    console.log(posts);

    for (const post of posts) {
      await PostModel.create({
        userId: post.userId,
        id: post.id,
        title: post.title,
        body: post.body,
      });
    }

    this.logger.log('Posts saved to database');
    return posts;
  }

  async getPostsFromDB() {
    try {
      return await PostModel.findAll();
    } catch (e) {
      throw e;
    }
  }

  async deletePostsFromDB() {
    try {
      await PostModel.destroy({
        where: {},
      });
      this.logger.log('Posts deleted from database');
    } catch (e) {
      throw e;
    }
  }
}
