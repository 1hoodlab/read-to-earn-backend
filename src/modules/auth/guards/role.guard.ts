import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, user } from '@prisma/client';

const matchRoles = (roles, userRole) => {
  return roles.some((role) => role === userRole);
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [context.getHandler(), context.getClass()]);
    if (!roles) {
      return true;
    }
    const req = context.switchToHttp().getRequest() as any;
    const user = req.user as user;
    return matchRoles(roles, user.role);
  }
}
