import { Module } from '@nestjs/common';
import { ContentModule } from './modules/content/content.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MediaModule } from './modules/media/media.module';
import { AuditModule } from './modules/audit/audit.module';
import { PublicApiModule } from './modules/public-api/public-api.module';

@Module({
  imports: [ContentModule, AuthModule, UsersModule, MediaModule, AuditModule, PublicApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
