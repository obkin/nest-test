import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserModel } from './models/user.model';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from './users.repository';
import { genSalt, hash } from 'bcrypt';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async createUser(dto: UserRegisterDto): Promise<UserModel> {
    try {
      const existingUser = await this.usersRepository.getUserByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User with such email already exists');
      }

      const hashedPassword = await this.hashPassword(dto.password);
      const newUser = await this.usersRepository.createUser({
        ...dto,
        password: hashedPassword,
      });

      return newUser;
    } catch (e) {
      throw e;
    }
  }

  async getUserByEmail(email: string): Promise<UserModel> {
    try {
      const user = await this.usersRepository.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException('User with such email not found');
      } else {
        return user;
      }
    } catch (e) {
      throw e;
    }
  }

  async getUserById(id: number): Promise<UserModel> {
    try {
      const user = await this.usersRepository.getUserById(id);
      if (!user) {
        throw new NotFoundException('User with such id not found');
      } else {
        return user;
      }
    } catch (e) {
      throw e;
    }
  }

  async getAllUsers(): Promise<UserModel[]> {
    try {
      return await this.usersRepository.getAllUsers();
    } catch (e) {
      throw e;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.usersRepository.deleteUserById(userId);

      this.logger.log(
        `User successfully deleted (userId: ${user.id}, email: ${user.email})`,
      );
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  public async hashPassword(password: string): Promise<string> {
    try {
      const saltRoundsString = this.configService.get<string>(
        'PASSWORD_SALT_ROUNDS',
      );
      if (!saltRoundsString) {
        throw new InternalServerErrorException(
          '[.env] PASSWORD_SALT_ROUNDS not configured',
        );
      }

      const saltRounds = Number(saltRoundsString);
      if (isNaN(saltRounds)) {
        throw new InternalServerErrorException(
          '[.env] PASSWORD_SALT_ROUNDS must be a valid number',
        );
      }

      const salt = await genSalt(saltRounds);
      return await hash(password, salt);
    } catch (e) {
      throw e;
    }
  }
}
