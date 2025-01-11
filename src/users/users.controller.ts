import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserModel } from './models/user.model';
import { UsersService } from './users.service';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { ChangeUserEmailDto } from './dto/change-user-email.dto';
import { Request } from 'express';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';

@ApiTags('users')
@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 201,
    description: 'New user created',
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
  @Post()
  async createUser(@Body() dto: UserRegisterDto) {
    try {
      return await this.usersService.createUser(dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to create new user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved user by email',
    type: UserModel,
  })
  @ApiResponse({
    status: 404,
    description: 'User with such email not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-by-email')
  async getUserByEmail(@Query('email') email: string) {
    try {
      return await this.usersService.getUserByEmail(email);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get user by email. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved user by id',
    type: UserModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong id format',
  })
  @ApiResponse({
    status: 404,
    description: 'User with such id not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @Get('/get-by-id/:id')
  async getUserById(@Param('id') id: number) {
    try {
      return await this.usersService.getUserById(id);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get user by id. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all users',
    type: [UserModel],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Get('/get-all')
  async getAllUsers() {
    try {
      const users = await this.usersService.getAllUsers();
      return { amount: users.length, users };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to get all users. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Change user email' })
  @ApiResponse({
    status: 200,
    description: 'User email changed',
    type: UserModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Enter a new email',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User with such email already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Put('/change-email')
  async changeUserEmail(@Body() dto: ChangeUserEmailDto, @Req() req: Request) {
    try {
      return await this.usersService.changeUserEmail(Number(req.user.id), dto);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to change user email. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'User password changed',
    type: UserModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Enter a new password',
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong old password',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @Put('/change-password')
  async changeUserPassword(
    @Body() dto: ChangeUserPasswordDto,
    @Req() req: Request,
  ) {
    try {
      return await this.usersService.changeUserPassword(
        Number(req.user.id),
        dto,
      );
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to change user password. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'This user is admin',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the user' })
  @HttpCode(200)
  @Delete('/delete-user/:id')
  async deleteUser(@Param('id') userId: number) {
    try {
      await this.usersService.deleteUser(userId);
      return {
        userId,
        message: 'User deleted',
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException(
          `Failed to delete the user. ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
