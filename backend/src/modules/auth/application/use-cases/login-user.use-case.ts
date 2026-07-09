import { IPasswordHasher } from '../ports/out/password-hasher.interface';
import { IUserRepository } from '../ports/out/user.repository.interface';
import { ITokenGenerator, AuthTokens } from '../ports/out/token-generator.interface';

export interface LoginCommand {
  email: string;
  password: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenGenerator: ITokenGenerator,
  ) {}

  public async execute(command: LoginCommand): Promise<AuthTokens> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'deactivated') {
      throw new Error('User account is deactivated');
    }

    const isPasswordValid = await this.passwordHasher.compare(command.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return this.tokenGenerator.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
