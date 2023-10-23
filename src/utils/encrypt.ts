import crypto from 'crypto';

const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string;
const iv = Buffer.from(key);

export function encryptData(data: string): string {
  try {
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    return Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]).toString('hex');
  } catch (error: any) {
    console.error(error);
    return '';
  }
}

export function decryptData(data: string): string {
  try {
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    return Buffer.concat([decipher.update(Buffer.from(data, 'hex')), decipher.final()]).toString('utf8');
  } catch (error: any) {
    console.error(error);
    return '';
  }
}
