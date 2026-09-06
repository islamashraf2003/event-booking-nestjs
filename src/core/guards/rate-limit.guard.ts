import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
    RATE_LIMIT_KEY,
    RateLimitOptions,
} from '../decorators/rate-limit.decorator.js';


const hits = new Map<string, { count: number; expiresAt: number }>();

function prune(now: number) {
    for (const [key, entry] of hits) {
        if (entry.expiresAt <= now) {
            hits.delete(key);
        }
    }
}

/**
 * Answers: "has this caller asked too often?"
 * Routes without @RateLimit() pass straight through.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const options = this.reflector.getAllAndOverride<RateLimitOptions>(
            RATE_LIMIT_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!options) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const key = `${context.getClass().name}.${context.getHandler().name}:${request.ip}`;
        const now = Date.now();

        if (hits.size > 10000) {
            prune(now);
        }

        const entry = hits.get(key);
        if (!entry || entry.expiresAt <= now) {
            hits.set(key, { count: 1, expiresAt: now + options.ttlMs });
            return true;
        }

        entry.count += 1;
        if (entry.count > options.limit) {
            const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
            throw new HttpException(
                `Too many requests, try again in ${retryAfter}s`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return true;
    }
}
