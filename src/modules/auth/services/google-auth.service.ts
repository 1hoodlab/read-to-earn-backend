import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';
import { AuthService } from './auth.service';
@Injectable()
export class GoogleAuthenticationService {
  private oauthClient: Auth.OAuth2Client;
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async authenticate(token: string): Promise<Auth.TokenInfo> {
    return await this.oauthClient.getTokenInfo(token);
  }
}
