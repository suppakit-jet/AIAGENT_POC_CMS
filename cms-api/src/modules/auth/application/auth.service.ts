import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.passwordHash) {
      const isMatch = await argon2.verify(user.passwordHash, pass);
      if (isMatch) {
        if (user.status !== 'ACTIVE') {
          throw new UnauthorizedException('User account is not active');
        }
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '60m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '14d' }),
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }
}
