import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/*
- Purpose: Protects routes by validating the access token ('jwt-at' strategy)
- Supports skipping auth check on routes marked as public (using custom metadata 'isPublic')
- Usage: Applied globally, but public routes bypass this guard
*/
@Injectable()
export class AtGuard extends AuthGuard('jwt-at') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route or controller is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Allow access if public
    if (isPublic) {
      return true;
    }

    // Otherwise, run the default passport jwt guard
    return super.canActivate(context);
  }
}
