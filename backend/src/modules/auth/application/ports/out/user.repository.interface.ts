import { User } from '../../../domain/entities/user.entity';

export interface IUserRepository {
  /**
   * ค้นหาผู้ใช้จากอีเมล
   * @param email อีเมลของผู้ใช้
   * @returns User entity หรือ null ถ้าไม่พบ
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * บันทึกข้อมูลผู้ใช้ใหม่หรืออัปเดตข้อมูลผู้ใช้
   * @param user ข้อมูลผู้ใช้ที่จะบันทึก
   * @returns void หลังจากบันทึกสำเร็จ
   */
  save(user: User): Promise<void>;
}
