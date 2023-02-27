import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from 'src/decorators/public.decorator';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly passwordService: PasswordService) {}

  @Public()
  @Post('/signup')
  async signUp(@Body() payload: SignUpDto) {
    let user = await this.authService.findUserByEmailOrUsername(payload.email);
    if (user) throw new BadRequestException(`User ${payload.email} was exist.`);

    let newUser = await this.authService.createCustomer({
      ...payload,
      password: await this.passwordService.hashPassword(payload.password),
    });

    let accessToken = this.authService.generateTokens({ userId: newUser.id, role: newUser.role });
    let userToken = await this.authService.createUserTokenByUserId(newUser.id, accessToken);

    return {
      access_token: userToken.access_token,
    };
  }

  @Public()
  @Post('/signin')
  async signIn(@Body() payload: SignInDto) {
    const user = await this.authService.findUserByEmailOrUsername(payload.username);

    if (!user) throw new BadRequestException(`Username or email: ${payload.username} not exist.`);

    let validatePassword = await this.passwordService.validatePassword(payload.password, user.password);
    if (!validatePassword) throw new BadRequestException(`Password incorrect.`);

    const accessToken = this.authService.generateTokens({
      userId: user.id,
      role: user.role,
    });
    await this.authService.updateUserTokenByUserId(user.id, accessToken);

    return {
      access_token: accessToken,
    };
  }
}
