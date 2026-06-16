import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key is missing');
    }

    // In a real implementation, we would hash the incoming key and compare it to keyHash
    // For MVP, we will assume the key passed is the ID of the ApiKey record for simplicity,
    // or just check if any key exists if we haven't built the UI for it yet.
    const keyRecord = await this.prisma.apiKey.findFirst({
      where: { keyHash: apiKey, revokedAt: null }
    });

    if (!keyRecord) {
      // Temporary fallback for MVP testing: if they pass a hardcoded "dev-key", let them in.
      if (apiKey === 'dev-key-123') return true;
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
