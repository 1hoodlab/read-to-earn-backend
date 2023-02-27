import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { user } from '@prisma/client';
import { AuthService } from './services/auth.service';
import { JwtDto } from './dto/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtDto): Promise<user> {
    const access_token = req.headers['authorization'].split(' ')[1];

    const user = await this.authService.validateUser(access_token, payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
