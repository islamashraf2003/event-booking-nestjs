import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser, RequestWithUser } from '../guards/auth.guard.js';

export const CurrentUser = createParamDecorator(
    (field: keyof AuthUser | undefined, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        return field ? request.user?.[field] : request.user;
    },
);
