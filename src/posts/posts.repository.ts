import { Injectable } from '@nestjs/common';
import { PostModel } from './models/post.model';

@Injectable()
export class PostsRepository {
  async findPostById(id: number): Promise<PostModel | null> {
    return await PostModel.findOne({ where: { id } });
  }

  async createPost(post: {
    userId: number;
    id: number;
    title: string;
    body: string;
  }): Promise<PostModel> {
    return await PostModel.create(post);
  }

  async findAllPosts(): Promise<PostModel[]> {
    return await PostModel.findAll();
  }

  async deleteAllPosts(): Promise<void> {
    await PostModel.destroy({ where: {} });
  }
}
