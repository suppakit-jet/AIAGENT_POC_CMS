import { IPasswordHasher } from '../../../application/ports/out/password-hasher.interface';
import * as argon2 from 'argon2';

export class Argon2PasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
