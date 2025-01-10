import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(UserModel) private userModel: typeof UserModel) {}

  async createUser(dto: UserRegisterDto): Promise<UserModel> {
    try {
      return this.userModel.create(dto);
    } catch (e) {
      throw e;
    }
  }

  async getUserByEmail(email: string): Promise<UserModel | null> {
    try {
      return await this.userModel.findOne({ where: { email } });
    } catch (e) {
      throw e;
    }
  }
}
