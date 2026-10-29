import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser, AuthenticatedRequest } from '../auth/auth-user';

/** Injects the authenticated user, or one of its fields. */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return field ? request.user?.[field] : request.user;
  },
);
