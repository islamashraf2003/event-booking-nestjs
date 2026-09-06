import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate-limit';

export interface RateLimitOptions {
    limit: number;
    ttlMs: number;
}

export const RateLimit = (limit: number, ttlMs: number) =>
    SetMetadata(RATE_LIMIT_KEY, { limit, ttlMs } as RateLimitOptions);
