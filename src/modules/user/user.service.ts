import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UserService {

    constructor(private readonly prismaService: PrismaService){}

    linkAccount(user_id: string, wallet_address: string){
        return this.prismaService.user.update({
            where: {
                id:user_id,
            },
            data: {
                wallet_address: wallet_address,
            }
        })
    }
}
