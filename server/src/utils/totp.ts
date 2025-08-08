import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface TOTPSecret {
  ascii: string;
  hex: string;
  base32: string;
  otpauth_url: string;
}

export class TOTPUtil {
  static generateSecret(label: string, issuer: string): TOTPSecret {
    const secret = speakeasy.generateSecret({ length: 20, name: `${issuer}:${label}`, issuer });
    return secret as unknown as TOTPSecret;
  }

  static async generateQRCodeDataURL(otpauthUrl: string): Promise<string> {
    return await QRCode.toDataURL(otpauthUrl);
  }

  static verifyToken(base32Secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: base32Secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}


