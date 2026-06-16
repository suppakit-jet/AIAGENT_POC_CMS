import { Injectable, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; name: string; role: Role }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');
    
    return this.prisma.user.create({
      data: {
        ...data,
        status: 'INVITED',
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, lastLoginAt: true }
    });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'DEACTIVATED' }
    });
  }
}
