import { User, UserProps } from '../../domain/entities/user.entity';
import { IPasswordHasher } from '../ports/out/password-hasher.interface';
import { IUserRepository } from '../ports/out/user.repository.interface';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  /**
   * ดำเนินการสมัครสมาชิกผู้ใช้ใหม่
   * ตรวจสอบว่าอีเมลซ้ำหรือไม่ และบันทึกผู้ใช้ลงในระบบ
   * @param props ข้อมูลผู้ใช้ใหม่
   * @returns Entity ของผู้ใช้ที่ถูกสร้างสำเร็จ
   * @throws Error ถ้าอีเมลถูกใช้งานไปแล้ว
   */
  public async execute(props: UserProps): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(props.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = await User.create(props, this.passwordHasher);
    await this.userRepository.save(newUser);

    return newUser;
  }
}
