import { CACHE_MANAGER, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { user, user_token } from '@prisma/client';
import { Cache } from 'cache-manager';
import { isEmail } from 'class-validator';
import { PrismaService } from 'nestjs-prisma';
import { SecurityConfig } from 'src/common/config/config.interface';
import { SignUpDto } from '../dto/auth.dto';
import { PasswordService } from './password.service';
@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(accessToken: string, userId: string): Promise<user> {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    let userToken = await this.prisma.user_token.findFirst({
      where: { user_id: userId },
    });
    if (!userToken || userToken.access_token !== accessToken) {
      throw new UnauthorizedException();
    }

    return user;
  }

  getUserFromToken(token: string): Promise<user> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  generateTokens(payload: { userId: string; role: string }) {
    return this._generateAccessToken(payload);
  }
  private _generateAccessToken(payload: { userId: string; role: string }): string {
    return this.jwtService.sign(payload);
  }

  private _getTokenByUserId(userId: string): Promise<user_token> {
    return this.prisma.user_token.findUnique({
      where: {
        user_id: userId,
      },
    });
  }

  createCustomer(payload: SignUpDto): Promise<user> {
    return this.prisma.user.create({
      data: payload,
    });
  }

  findUserById(userId: string): Promise<user> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
  }

  /**
   * Stuff with one argument.
   * @method findUserByEmailOrUsername
   * @param {string} input email or username value
   */
  findUserByEmailOrUsername(input: string): Promise<user> {
    let condition = {};
    isEmail(input) ? (condition = { email: input }) : (condition = { username: input });
    return this.prisma.user.findFirst({
      where: condition,
    });
  }

  createUserTokenByUserId(userId: string, accessToken: string): Promise<user_token> {
    return this.prisma.user_token.create({
      data: {
        user_id: userId,
        access_token: accessToken,
      },
    });
  }

  updateUserTokenByUserId(userId: string, accessToken: string): Promise<user_token> {
    return this.prisma.user_token.upsert({
      where: {
        user_id: userId,
      },
      update: {
        access_token: accessToken,
      },
      create: {
        user_id: userId,
        access_token: accessToken,
      },
    });
  }
}
