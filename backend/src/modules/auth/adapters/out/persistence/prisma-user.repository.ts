import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../../application/ports/out/user.repository.interface';
import { User, Role } from '../../../domain/entities/user.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  /**
   * ค้นหาผู้ใช้ในฐานข้อมูลจากที่อยู่อีเมล
   * @param email อีเมลของผู้ใช้ที่ต้องการค้นหา
   * @returns User entity ที่ Reconstitute จากฐานข้อมูล หรือ null ถ้าไม่พบ
   */
  async findByEmail(email: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({ where: { email } });
    if (!dbUser) return null;

    return User.restore({
      id: dbUser.id,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      role: dbUser.role as Role,
      status: (dbUser as any).status ?? 'active',
    });
  }

  /**
   * บันทึกข้อมูลผู้ใช้ใหม่หรืออัปเดตลงในฐานข้อมูล Prisma
   * @param user ข้อมูล User Entity ที่สมบูรณ์และถูกต้องแล้ว
   */
  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.password,
        role: user.role,
        status: user.status,
      } as any,
    });
  }
}
