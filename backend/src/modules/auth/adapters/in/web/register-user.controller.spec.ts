import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUserController } from './register-user.controller';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';

describe('RegisterUserController', () => {
  let controller: RegisterUserController;
  let mockUseCase: Partial<RegisterUserUseCase>;

  beforeEach(() => {
    mockUseCase = {
      execute: vi.fn(),
    };
    controller = new RegisterUserController(mockUseCase as RegisterUserUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call execute on use case and return success message', async () => {
    const dto = { email: 'test@example.com', password: 'password123', role: 'admin' };
    
    const result = await controller.register(dto);

    expect(mockUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'User registered successfully' });
  });
});
