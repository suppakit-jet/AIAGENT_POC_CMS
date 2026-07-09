export interface IPasswordHasher {
  /**
   * สร้าง Hash ของรหัสผ่านด้วยอัลกอริทึมที่กำหนด (เช่น Argon2id)
   * @param password รหัสผ่านแบบ Plain-text
   * @returns รหัสผ่านที่ถูก Hash แล้ว
   */
  hash(password: string): Promise<string>;

  /**
   * เปรียบเทียบรหัสผ่านแบบ Plain-text กับค่าที่ถูก Hash ไว้
   * @param plain รหัสผ่านแบบ Plain-text
   * @param hash รหัสผ่านที่ถูก Hash ไว้
   * @returns true ถ้ารหัสผ่านตรงกัน, false ถ้าไม่ตรงกัน
   */
  compare(plain: string, hash: string): Promise<boolean>;
}
