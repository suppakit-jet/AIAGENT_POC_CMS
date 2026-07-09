export enum Role {
  Admin = 'Admin',
  Editor = 'Editor',
  Author = 'Author',
}

import { randomUUID } from 'crypto';
import { IPasswordHasher } from '../../application/ports/out/password-hasher.interface';

export interface UserProps {
  id?: string;
  email: string;
  password: string;
  role: Role;
  status?: 'active' | 'deactivated';
}

export const MIN_PASSWORD_LENGTH = 12;

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly password: string;
  public readonly role: Role;
  public readonly status: 'active' | 'deactivated';

  private constructor(props: UserProps, hashedPassword: string) {
    this.id = props.id ?? randomUUID();
    this.email = props.email;
    this.password = hashedPassword;
    this.role = props.role;
    this.status = props.status ?? 'active';
  }

  /**
   * Factory method สำหรับสร้าง User Entity ใหม่ (ตรวจสอบ Invariant และ Hash รหัสผ่าน)
   * @param props ข้อมูลเบื้องต้นที่ต้องการใช้สร้าง User (รหัสผ่านเป็น Plain-text)
   * @param hasher Injected Dependency สำหรับใช้คำนวณ Password Hash (เช่น Argon2id)
   * @returns Instance ของ User ที่มีความถูกต้องสมบูรณ์ (Valid State)
   * @throws Error ถ้ารหัสผ่านสั้นกว่าข้อกำหนด หรือระบุ Role ไม่ถูกต้อง
   */
  public static async create(props: UserProps, hasher: IPasswordHasher): Promise<User> {
    if (props.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }

    const hasLetter = /[a-zA-Z]/.test(props.password);
    const hasDigit = /\d/.test(props.password);
    if (!hasLetter || !hasDigit) {
      throw new Error('Password must contain at least one letter and one digit');
    }

    if (!Object.values(Role).includes(props.role as Role)) {
      throw new Error(`Invalid role. Expected one of: ${Object.values(Role).join(', ')}`);
    }

    const hashedPassword = await hasher.hash(props.password);

    return new User(props, hashedPassword);
  }

  /**
   * Reconstitute a User entity from database data (bypass validations and hashing)
   * คำเตือน: ใช้เฉพาะ reconstruct จาก DB เท่านั้น
   */
  public static restore(props: {
    id: string;
    email: string;
    passwordHash: string;
    role: Role;
    status: 'active' | 'deactivated';
  }): User {
    return new User(
      {
        id: props.id,
        email: props.email,
        password: props.passwordHash,
        role: props.role,
        status: props.status,
      },
      props.passwordHash,
    );
  }
}
