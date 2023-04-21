import { BadRequestException, Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma, Role, user_token } from '@prisma/client';
import { Public } from 'src/decorators/public.decorator';
import { GoogleTokenDto, SignInDto, SignUpDto } from './dto/auth.dto';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { GoogleAuthenticationService } from './services/google-auth.service';
import { nanoid } from 'nanoid';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Public()
  @Post('/login-with-google')
  async loginWithGoogle(@Body() payload: GoogleTokenDto) {
    let userToken: user_token;

    const tokenInfo = await this.googleAuthenticationService.authenticate(payload.token);
    const user = await this.authService.findUserByEmailOrUsername(tokenInfo.email);

    if (!user) {
      const newUser = await this.authService.createUserDefault(tokenInfo.email);
      const accessToken = await this.authService.generateTokens({ userId: newUser.id, role: newUser.role });
      userToken = await this.authService.createUserTokenByUserId(newUser.id, accessToken);
    } else {
      userToken = await this.authService.updateUserTokenByUserId(
        user.id,
        await this.authService.generateTokens({ userId: user.id, role: user.role }),
      );
    }

    return {
      accessToken: userToken.access_token,
    };
  }
  @Public()
  @Post('/signup')
  async signUp(@Body() payload: SignUpDto) {
    try {
      const salt = nanoid();

      let newUser = await this.authService.createCustomer(
        {
          ...payload,
          password: await this.passwordService.hashPassword(payload.password, salt),
        },
        salt,
      );

      let accessToken = this.authService.generateTokens({ userId: newUser.id, role: newUser.role });
      let userToken = await this.authService.createUserTokenByUserId(newUser.id, accessToken);

      return {
        access_token: userToken.access_token,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2022: Unique constraint failed
        // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code === 'P2002') {
          throw new HttpException('User already exists', 400);
        }
      }
    }
  }

  @Public()
  @Post('/signin')
  async signIn(@Body() payload: SignInDto) {
    const user = await this.authService.findUserByEmailOrUsername(payload.username);

    if (!user) throw new BadRequestException(`Username or email: ${payload.username} not exist.`);

    let validatePassword = await this.passwordService.validatePassword(payload.password, user.salt, user.password);
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
