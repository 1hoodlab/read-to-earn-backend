import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { SecurityConfig } from 'src/common/config/config.interface';

@Injectable()
export class PasswordService {
  get bcryptSaltRounds(): string | number {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const saltOrRounds = securityConfig.bcryptSaltOrRound;

    return Number.isInteger(Number(saltOrRounds)) ? Number(saltOrRounds) : saltOrRounds;
  }

  constructor(private configService: ConfigService) {}

  validatePassword(password: string, salt: string, hashedPassword: string): Promise<boolean> {
    return compare(password + salt, hashedPassword);
  }

  hashPassword(password: string, salt: string): Promise<string> {
    return hash(password + salt, this.bcryptSaltRounds);
  }
}
