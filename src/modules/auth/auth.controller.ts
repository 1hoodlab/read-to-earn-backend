import { BadRequestException, Body, Controller, Get, Header, Headers, HttpException, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma, Role, user_token } from '@prisma/client';
import { Public } from 'src/decorators/public.decorator';
import { GoogleTokenDto, SignInDto, SignInWithMetamakasDto, SignUpDto } from './dto/auth.dto';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { GoogleAuthenticationService } from './services/google-auth.service';
import { nanoid } from 'nanoid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { generateSignInMessage } from 'src/_serivces/util.service';
import { ethers } from 'ethers';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Get('/metmask/signin-message')
  async getMessagePreSignIn(@Headers('x-wallet-address') walletAddress: string) {
    const user = await this.authService.findUserByWalletAddress(walletAddress);
    if (!user) {
      const nonce = nanoid();
      await this.cacheManager.set(walletAddress, nonce, 0);
      return generateSignInMessage(walletAddress.toLowerCase(), nonce);
    }

    return generateSignInMessage(user.auth_metamask_wallet.toLowerCase(), user.nonce_auth_metamask);
  }
  @Public()
  @Post('/metmask/signin')
  async signinWithMetamask(@Body() body: SignInWithMetamakasDto) {
    const user = await this.authService.findUserByWalletAddress(body.wallet_address);

    const newNonce = nanoid();

    const nonce: string = await this.cacheManager.get(body.wallet_address);

    const message = generateSignInMessage(
      user ? user.auth_metamask_wallet.toLowerCase() : body.wallet_address.toLowerCase(),
      user ? user.nonce_auth_metamask : nonce,
    );

    const recoveredAddress = ethers.utils.verifyMessage(message, body.msg_signature);

    if (recoveredAddress.toLowerCase() !== (user ? user.auth_metamask_wallet.toLowerCase() : body.wallet_address.toLowerCase()))
      throw new Error('Signature Invaid');

    if (!user) {
      const newUser = await this.authService.createUerByWalletAddress(body.wallet_address, newNonce);

      let accessToken = this.authService.generateTokens({ userId: newUser.id, role: newUser.role });
      return await this.authService.createUserTokenByUserId(newUser.id, accessToken);
    }

    await this.authService.updateAuthMetamaskNonce(user.id, newNonce);

    let accessToken = this.authService.generateTokens({ userId: user.id, role: user.role });

    return await this.authService.updateUserTokenByUserId(user.id, accessToken);
  }

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
          throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
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
