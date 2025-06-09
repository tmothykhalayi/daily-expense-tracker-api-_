import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { JWTPayload } from '../strategies/at.strategy';

interface UserRequest extends Request {
  user?: JWTPayload; // Extend Request to include user property
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles metadata, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;

    // If no user info on request, deny access
    if (!user) {
      return false;
    }

    // Fetch user role from DB to ensure up-to-date role info (optional)
    const dbUser = await this.userRepository.findOne({
      where: { id: user.sub },
      select: ['id', 'role'],
    });

    // If user not found in DB, deny access
    if (!dbUser) {
      return false;
    }

    // Check if user's role matches any required role
    return requiredRoles.includes(dbUser.role);
  }
}
