import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES = 'roles';
export const Roles = (roles: Role[]) => SetMetadata(ROLES, roles);
