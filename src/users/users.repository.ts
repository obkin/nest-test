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

  async getUserById(id: number): Promise<UserModel> {
    try {
      return await this.userModel.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  async getAllUsers(): Promise<UserModel[]> {
    try {
      return await this.userModel.findAll();
    } catch (e) {
      throw e;
    }
  }

  async changeUserEmail(user: UserModel, newEmail: string): Promise<UserModel> {
    try {
      user.email = newEmail;
      await user.save();

      return user;
    } catch (e) {
      throw e;
    }
  }

  async changeUserPassword(
    user: UserModel,
    newPassword: string,
  ): Promise<UserModel> {
    try {
      user.password = newPassword;
      await user.save();

      return user;
    } catch (e) {
      throw e;
    }
  }

  async deleteUserById(userId: number): Promise<void> {
    try {
      await this.userModel.destroy({ where: { id: userId } });
    } catch (e) {
      throw e;
    }
  }
}
