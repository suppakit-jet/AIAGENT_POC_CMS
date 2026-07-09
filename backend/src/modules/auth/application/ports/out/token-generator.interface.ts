export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface ITokenGenerator {
  generateTokens(payload: TokenPayload): Promise<AuthTokens>;
}
