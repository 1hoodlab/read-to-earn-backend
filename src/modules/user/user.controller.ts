import { Controller, Get } from '@nestjs/common';
import { user } from '@prisma/client';
import { User } from 'src/decorators/user.decorator';
import { PrismaService } from 'nestjs-prisma';
import { omit } from 'lodash';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('user')
@ApiTags("User")
export class UserController {
  constructor(private readonly prismaService: PrismaService) {}

  @ApiBearerAuth()
  @Get('detail')
  async getUserDetail(@User() user: user) {
    return omit(user, ['password', 'token_expiry_date', 'time_send_token']);
  }

  //TODO: Link account

  //TODO: Request to writer
}
