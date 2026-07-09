import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';

@Controller('api/admin/auth')
export class RegisterUserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post('register')
  async register(@Body() dto: any) {
    await this.registerUserUseCase.execute(dto);
    return { message: 'User registered successfully' };
  }
}
