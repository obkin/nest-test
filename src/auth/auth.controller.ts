import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserModel } from 'src/users/models/user.model';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'New user registered',
    type: UserModel,
  })
  @ApiResponse({
    status: 409,
    description: 'User with such email already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Public()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('/register')
  async register(@Body() dto: UserRegisterDto) {
    try {
      return await this.authService.userRegister(dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to register new user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Login as user' })
  @ApiResponse({
    status: 200,
    description: 'Signed in as user',
    type: UserLoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong email or password',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Public()
  @HttpCode(200)
  @Post('/login')
  async login(@Body() dto: UserLoginDto) {
    try {
      return await this.authService.userLogin(dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to login. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User logged out',
  })
  @ApiResponse({
    status: 400,
    description: 'This user is not logged in',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Delete('/logout')
  async logout(@Req() req: Request) {
    try {
      const userId = Number(req.user.id);
      await this.authService.userLogout(userId);
      return { userId, message: 'User logged out' };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to logout. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // --- Methods ---

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token / Refresh token is required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Public()
  @HttpCode(200)
  @Post('/refresh')
  async refreshAccessToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    try {
      return {
        accessToken: await this.authService.refreshAccessToken(refreshToken),
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to refresh access token. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
