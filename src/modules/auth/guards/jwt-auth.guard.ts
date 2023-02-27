import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { AuthGuard } from '@nestjs/passport';
  import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
      super();
    }
    async canActivate(context: ExecutionContext): Promise<any> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (isPublic) {
        return true;
      }
  
      // process headers
      // let request = context.switchToHttp().getRequest();
  
      return await super.canActivate(context);
  
      // let request = context.switchToHttp().getRequest();
      // because header of socket.io and restfulAPIs difference
      // so process for 2 cases or create socket-io.guard.ts file
    }
  
    handleRequest(err, user, info) {
      // You can throw an exception based on either "info" or "err" arguments
      if (err || !user) {
        throw err || new UnauthorizedException();
      }
      return user;
    }
  }
  