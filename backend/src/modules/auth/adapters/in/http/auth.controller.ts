import {
  Controller,
  Post,
  Body,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { Role } from '../../../domain/entities/user.entity';

export class RegisterUserDto {
  email!: string;
  password!: string;
  role!: Role;
}

@Controller('api/admin/auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  /**
   * ดำเนินการสมัครสมาชิกผู้ใช้ใหม่ในระบบผ่าน HTTP POST
   * @param dto ข้อมูลผู้ใช้ที่ต้องการสมัครสมาชิก (อีเมล, รหัสผ่าน, บทบาท)
   * @returns ข้อมูลผู้ใช้ใหม่พร้อมรหัสสถานะ HTTP 201 Created
   * @throws ConflictException กรณีอีเมลนี้มีอยู่ในระบบแล้ว (HTTP 409)
   * @throws BadRequestException กรณีข้อมูลไม่ถูกต้องหรือรหัสผ่านสั้นกว่าข้อกำหนด (HTTP 400)
   * @throws InternalServerErrorException กรณีเกิดข้อผิดพลาดจากระบบภายใน (HTTP 500)
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    try {
      const user = await this.registerUserUseCase.execute(dto);
      return {
        statusCode: HttpStatus.CREATED,
        data: {
          email: user.email,
          role: user.role,
        },
      };
    } catch (error: any) {
      const message = error?.message || 'Unknown error';
      if (message.includes('already exists')) {
        throw new ConflictException(message);
      }
      if (message.includes('Password') || message.includes('Invalid role')) {
        throw new BadRequestException(message);
      }
      throw new InternalServerErrorException(message);
    }
  }
}
