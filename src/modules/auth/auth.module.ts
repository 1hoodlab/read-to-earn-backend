import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from 'src/common/config/config.interface';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthenticationService } from './services/google-auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: securityConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    GoogleAuthenticationService,
    PasswordService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, AuthService], // AuthService using for jwt-auth.guard.ts (DI)
  controllers: [AuthController],
})
export class AuthModule {}
