import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
} from './auth.repository';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserModel } from 'src/users/models/user.model';
import { UserLoginDto } from './dto/user-login.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { IUserTokens } from './interfaces';
import { compare } from 'bcrypt';
import { AccessTokenDto } from './dto/access-token.dto';
import { AccessTokenModel } from './models/access-token.model';
import { addDays } from 'date-fns';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenModel } from './models/refresh-token.model';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly accessTokenRepository: AccessTokenRepository,
  ) {}

  async userRegister(dto: UserRegisterDto): Promise<UserModel> {
    try {
      const newUser = await this.usersService.createUser(dto);
      if (!newUser) {
        throw new InternalServerErrorException(
          'User was not created. UsersService did not return UserModel',
        );
      } else {
        return newUser;
      }
    } catch (e) {
      throw e;
    }
  }

  async userLogin(dto: UserLoginDto): Promise<UserLoginResponseDto> {
    try {
      const validatedUser = await this.validateUser(dto);
      if (!validatedUser) {
        throw new BadRequestException('Wrong password');
      }

      const isUserLoggined = await this.checkIsUserLoggedIn(validatedUser.id);
      if (isUserLoggined) {
        await this.userLogout(validatedUser.id);
      }

      const JWTtokens = await this.generateTokens(validatedUser);
      const user = await this.usersService.getUserByEmail(validatedUser.email);

      await this.saveAccessToken({
        userId: user.id,
        accessToken: JWTtokens.accessToken,
        expiresIn: addDays(new Date(), 1),
      });

      await this.saveRefreshToken({
        userId: user.id,
        refreshToken: JWTtokens.refreshToken,
        expiresIn: addDays(new Date(), 30),
      });

      this.logger.log(
        `Signed in as user (user: ${user.email} / userId: ${user.id})`,
      );
      return {
        id: validatedUser.id,
        email: validatedUser.email,
        accessToken: JWTtokens.accessToken,
        refreshToken: JWTtokens.refreshToken,
      };
    } catch (e) {
      throw e;
    }
  }

  async userLogout(userId: number): Promise<void> {
    try {
      await this.deleteAccessToken(userId);
      await this.deleteRefreshToken(userId);
      this.logger.log(`User logged out (userId: ${userId})`);
    } catch (e) {
      if (e?.status === 404) {
        this.logger.warn(
          `Failed to logout (userId: ${userId} / error: This user is not logged in)`,
        );
        throw new UnauthorizedException('This user is not logged in');
      } else {
        throw e;
      }
    }
  }

  // --- Methods ---

  private async validateUser(dto: UserLoginDto): Promise<UserModel | null> {
    try {
      const user = await this.usersService.getUserByEmail(dto.email);
      if (user && (await this.verifyPassword(dto.password, user))) {
        return user;
      } else {
        return null;
      }
    } catch (e) {
      throw e;
    }
  }

  private async verifyPassword(
    password: string,
    user: UserModel,
  ): Promise<boolean> {
    try {
      return await compare(password, user.password);
    } catch (e) {
      throw e;
    }
  }

  // --- JWT logic ---

  private async generateTokens(user: UserModel): Promise<IUserTokens> {
    try {
      const payload = {
        id: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
      };
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
      });
      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        {
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      );
      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw e;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const userId = Number(decoded.sub);

      const storedToken =
        await this.refreshTokenRepository.findRefreshTokenByUserId(userId);
      if (!storedToken || storedToken.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token / not found');
      }

      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newAccessToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          iat: Math.floor(Date.now() / 1000),
        },
        {
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      );

      await this.saveAccessToken(
        {
          userId: user.id,
          accessToken: newAccessToken,
          expiresIn: addDays(new Date(), 1),
        },
        false,
      );

      this.logger.log(`Access token refreshed (userId: ${userId})`);
      return newAccessToken;
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // --- Refresh tokens' logic ---
  async saveRefreshToken(dto: RefreshTokenDto): Promise<RefreshTokenModel> {
    try {
      const existingRefreshToken =
        await this.refreshTokenRepository.findRefreshTokenByUserId(dto.userId);
      if (existingRefreshToken) {
        await this.refreshTokenRepository.deleteRefreshToken(dto.userId);
      }
      const savedRefreshToken =
        await this.refreshTokenRepository.saveRefreshToken(dto);
      if (!savedRefreshToken) {
        throw new InternalServerErrorException(
          'Refresh token not saved. RefreshTokenRepository did not return RefreshTokenEntity',
        );
      } else {
        this.logger.log(`Refresh token saved (userId: ${dto.userId})`);
        return savedRefreshToken;
      }
    } catch (e) {
      if (e.code === '23505') {
        this.logger.warn(
          `Failed to save refresh token (userId: ${dto.userId} / error: Such refresh token already exists)`,
        );
        throw new ConflictException('Such refresh token already exists');
      } else {
        this.logger.error(
          `Failed to save refresh token (userId: ${dto.userId} / error: ${e.message})`,
        );
        throw e;
      }
    }
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    try {
      await this.refreshTokenRepository.deleteRefreshToken(userId);
      this.logger.log(`Refresh token deleted (userId: ${userId})`);
    } catch (e) {
      this.logger.warn(
        `Failed to delete refresh token (userId: ${userId} / error: ${e.message})`,
      );
      throw e;
    }
  }

  async getRefreshToken(userId: number): Promise<RefreshTokenModel> {
    try {
      const refreshToken =
        await this.refreshTokenRepository.findRefreshTokenByUserId(userId);
      if (!refreshToken) {
        throw new NotFoundException('Such refresh token not found');
      } else {
        return refreshToken;
      }
    } catch (e) {
      throw e;
    }
  }

  // --- Access tokens' logic ---

  async saveAccessToken(
    dto: AccessTokenDto,
    shouldLog: boolean = true,
  ): Promise<AccessTokenModel> {
    try {
      const existingAccessToken =
        await this.accessTokenRepository.findAccessTokenByUserId(dto.userId);
      if (existingAccessToken) {
        await this.accessTokenRepository.deleteAccessToken(dto.userId);
      }
      const savedAccessToken =
        await this.accessTokenRepository.saveAccessToken(dto);
      if (!savedAccessToken) {
        throw new InternalServerErrorException(
          'Access token not saved. AccessTokenRepository did not return AccessTokenEntity',
        );
      } else {
        if (shouldLog) {
          this.logger.log(`Access token saved (userId: ${dto.userId})`);
        }
        return savedAccessToken;
      }
    } catch (e) {
      if (e.code === '23505') {
        this.logger.warn(
          `Failed to save access token (userId: ${dto.userId} / error: Such access token already exists)`,
        );
        throw new ConflictException('Such access token already exists');
      } else {
        this.logger.error(
          `Failed to save access token (userId: ${dto.userId} / error: ${e.message})`,
        );
        throw e;
      }
    }
  }

  async deleteAccessToken(userId: number): Promise<void> {
    try {
      await this.accessTokenRepository.deleteAccessToken(userId);
      this.logger.log(`Access token deleted (userId: ${userId})`);
    } catch (e) {
      this.logger.warn(
        `Failed to delete access token (userId: ${userId} / error: ${e.message})`,
      );
      throw e;
    }
  }

  async getAccessToken(userId: number): Promise<AccessTokenModel> {
    try {
      const accessToken =
        await this.accessTokenRepository.findAccessTokenByUserId(userId);
      if (!accessToken) {
        throw new NotFoundException('Such access token not found');
      } else {
        return accessToken;
      }
    } catch (e) {
      throw e;
    }
  }

  // --- Methods ---

  public async checkIsUserLoggedIn(userId: number): Promise<boolean> {
    try {
      const dbAccessToken =
        await this.accessTokenRepository.findAccessTokenByUserId(userId);
      if (!dbAccessToken) {
        this.logger.warn(
          `Access token not found in database, fetching refresh token (userId: ${userId})`,
        );

        const dbRefreshToken =
          await this.refreshTokenRepository.findRefreshTokenByUserId(userId);
        if (!dbRefreshToken) {
          this.logger.warn(
            `Refresh token not found in database (userId: ${userId})`,
          );
          return false;
        } else {
          this.logger.log(
            `Refresh token found in database (userId: ${userId})`,
          );
        }
      } else {
        this.logger.log(`Access token found in database (userId: ${userId})`);
      }

      return true;
    } catch (e) {
      this.logger.error(
        `Error checking user login status (userId: ${userId}): ${e.message}`,
      );
      throw e;
    }
  }
}
