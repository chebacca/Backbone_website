import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  twofaPending?: boolean;
}

export class JwtUtil {
  static generateTokens(payload: JwtPayload) {
    const accessToken = jwt.sign(payload as any, config.jwtSecret as any, {
      expiresIn: config.jwtExpiresIn as any,
    } as any);

    const refreshToken = jwt.sign(payload as any, config.jwtSecret as any, {
      expiresIn: config.jwtRefreshExpiresIn as any,
    } as any);

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  static generateActivationToken(userId: string): string {
    return jwt.sign({ userId, type: 'activation' } as any, config.jwtSecret as any, {
      expiresIn: '24h',
    } as any);
  }

  static generatePasswordResetToken(userId: string): string {
    return jwt.sign({ userId, type: 'password-reset' } as any, config.jwtSecret as any, {
      expiresIn: '1h',
    } as any);
  }

  static verifyActivationToken(token: string): { userId: string } {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    if (payload.type !== 'activation') {
      throw new Error('Invalid token type');
    }
    return { userId: payload.userId };
  }

  static verifyPasswordResetToken(token: string): { userId: string } {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    if (payload.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    return { userId: payload.userId };
  }

  static generateInterimToken(payload: Omit<JwtPayload, 'twofaPending'>): string {
    return jwt.sign({ ...payload, twofaPending: true } as any, config.jwtSecret as any, {
      expiresIn: '5m',
    } as any);
  }
}
