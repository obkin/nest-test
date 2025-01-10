import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UserCreateDto } from './dto/user-create.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async createUser(dto: UserCreateDto): Promise<User> {
    try {
      return this.userModel.create(dto);
    } catch (e) {
      throw e;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }
}
