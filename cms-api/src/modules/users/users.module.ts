import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { UsersController } from './adapters/in/users.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
