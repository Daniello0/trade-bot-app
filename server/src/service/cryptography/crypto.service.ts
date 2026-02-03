import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as process from 'node:process';

@Injectable()
export class CryptoService {
    private readonly key: Buffer;
    private readonly iv: Buffer;
    private readonly algorithm = 'aes-256-cbc';

    constructor() {
        this.key = Buffer.from(String(process.env.ENCRYPTION_KEY), 'hex');
        this.iv = Buffer.from(String(process.env.ENCRYPTION_IV), 'hex');
    }

    encrypt(text: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decrypt(encryptedText: string): string {
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.key,
            this.iv
        );
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
