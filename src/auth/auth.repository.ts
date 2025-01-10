import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RefreshTokenModel } from './models/refresh-token.model';
import { AccessTokenModel } from './models/access-token.model';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenDto } from './dto/access-token.dto';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokenModel)
    private readonly refreshTokenModel: typeof RefreshTokenModel,
  ) {}

  async saveRefreshToken(dto: RefreshTokenDto): Promise<RefreshTokenModel> {
    try {
      const token = this.refreshTokenModel.create(dto);
      return token;
    } catch (e) {
      throw e;
    }
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    try {
      const result = await this.refreshTokenModel.destroy({
        where: { userId },
      });
      if (result === 0) {
        throw new NotFoundException('Token not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async findRefreshTokenByUserId(
    userId: number,
  ): Promise<RefreshTokenModel | null> {
    try {
      return await this.refreshTokenModel.findOne({
        where: { userId },
      });
    } catch (e) {
      throw e;
    }
  }

  async getAllRefreshTokens(): Promise<RefreshTokenModel[]> {
    try {
      return await this.refreshTokenModel.findAll();
    } catch (e) {
      throw e;
    }
  }
}

@Injectable()
export class AccessTokenRepository {
  constructor(
    @InjectModel(AccessTokenModel)
    private readonly accessTokenModel: typeof AccessTokenModel,
  ) {}

  async saveAccessToken(dto: AccessTokenDto): Promise<AccessTokenModel> {
    try {
      const token = this.accessTokenModel.create(dto);
      return token;
    } catch (e) {
      throw e;
    }
  }

  async deleteAccessToken(userId: number): Promise<void> {
    try {
      const result = await this.accessTokenModel.destroy({
        where: { userId },
      });
      if (result === 0) {
        throw new NotFoundException('Token not found');
      }
    } catch (e) {
      throw e;
    }
  }

  async findAccessTokenByUserId(
    userId: number,
  ): Promise<AccessTokenModel | null> {
    try {
      return await this.accessTokenModel.findOne({
        where: { userId },
      });
    } catch (e) {
      throw e;
    }
  }

  async getAllAccessTokens(): Promise<AccessTokenModel[]> {
    try {
      return await this.accessTokenModel.findAll();
    } catch (e) {
      throw e;
    }
  }
}
