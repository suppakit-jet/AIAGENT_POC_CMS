import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginController, LoginDto } from './login.controller';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';
import {
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';

describe('LoginController', () => {
  let controller: LoginController;
  let mockLoginUserUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockLoginUserUseCase = {
      execute: vi.fn(),
    };

    controller = new LoginController(
      mockLoginUserUseCase as unknown as LoginUserUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login user and return access token with status 200 OK', async () => {
    const dto: LoginDto = {
      email: 'admin@example.com',
      password: 'StrongPassword123!',
    };

    mockLoginUserUseCase.execute.mockResolvedValue({
      accessToken: 'jwt.token.string',
    });

    const result = await controller.login(dto);

    expect(mockLoginUserUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      statusCode: HttpStatus.OK,
      data: {
        accessToken: 'jwt.token.string',
      },
    });
  });

  it('should throw UnauthorizedException when credentials are invalid', async () => {
    const dto: LoginDto = {
      email: 'admin@example.com',
      password: 'WrongPassword!',
    };

    mockLoginUserUseCase.execute.mockRejectedValue(
      new Error('Invalid email or password'),
    );

    await expect(controller.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException when user is deactivated', async () => {
    const dto: LoginDto = {
      email: 'deactivated@example.com',
      password: 'ValidPassword123!',
    };

    mockLoginUserUseCase.execute.mockRejectedValue(
      new Error('User account is deactivated'),
    );

    await expect(controller.login(dto)).rejects.toThrow(ForbiddenException);
  });

  it('should throw InternalServerErrorException on unexpected errors', async () => {
    const dto: LoginDto = {
      email: 'admin@example.com',
      password: 'ValidPassword123!',
    };

    mockLoginUserUseCase.execute.mockRejectedValue(
      new Error('Database connection failed'),
    );

    await expect(controller.login(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should instantiate LoginDto and handle unknown error objects correctly', async () => {
    const dto = new LoginDto();
    dto.email = 'admin@example.com';
    dto.password = 'password';

    mockLoginUserUseCase.execute.mockRejectedValue({});

    await expect(controller.login(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
