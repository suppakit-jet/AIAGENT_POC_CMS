import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import {
  ITokenGenerator,
  TokenPayload,
  AuthTokens,
} from '../../../application/ports/out/token-generator.interface';

@Injectable()
export class JwtTokenGenerator implements ITokenGenerator {
  constructor(
    private readonly secret: string = process.env.JWT_SECRET || 'default-secret-key',
  ) {}

  async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600; // 1 hour expiration

    const fullPayload = {
      ...payload,
      iat,
      exp,
    };

    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
    const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

    const signature = createHmac('sha256', this.secret)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64url');

    const accessToken = `${base64Header}.${base64Payload}.${signature}`;

    return {
      accessToken,
    };
  }
}
