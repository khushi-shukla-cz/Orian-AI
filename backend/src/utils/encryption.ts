import CryptoJS from 'crypto-js';
import config from '../config';

export class Encryption {
  private static key = config.encryption.key;

  static encrypt(text: string): string {
    try {
      return CryptoJS.AES.encrypt(text, this.key).toString();
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decrypt(ciphertext: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
}
