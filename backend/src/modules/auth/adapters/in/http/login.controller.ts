import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  HttpStatus,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';

export class LoginDto {
  email!: string;
  password!: string;
}

@Controller('api/admin/auth')
export class LoginController {
  constructor(
    @Inject(LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    try {
      const tokens = await this.loginUserUseCase.execute(dto);
      return {
        statusCode: HttpStatus.OK,
        data: {
          accessToken: tokens.accessToken,
        },
      };
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      if (message.includes('Invalid email or password')) {
        throw new UnauthorizedException(message);
      }
      if (message.includes('deactivated')) {
        throw new ForbiddenException(message);
      }
      throw new InternalServerErrorException(message);
    }
  }
}
