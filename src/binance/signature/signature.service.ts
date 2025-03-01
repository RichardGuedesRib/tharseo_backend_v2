import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SignatureService {
  private readonly HMAC_SHA256 = 'sha256';

  getSignature(data: string, key: string): string {
    try {
      return crypto
        .createHmac(this.HMAC_SHA256, key)
        .update(data)
        .digest('hex');
    } catch (error) {
      throw new Error('Failed to calculate HMAC-SHA256: ' + error.message);
    }
  }
}
