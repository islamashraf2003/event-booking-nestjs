import type { ObserveOptions } from '@nestjs/observe';

export function resolveObserveOptions(
  env: NodeJS.ProcessEnv = process.env,
): ObserveOptions | null {
  const appKey = env.OBSERVE_APP_KEY?.trim();
  const appSecret = env.OBSERVE_APP_SECRET?.trim();

  if (!appKey || !appSecret) {
    return null;
  }

  return {
    appKey,
    appSecret,
    serviceId: env.OBSERVE_SERVICE_ID?.trim() || 'event-booking-nestjs',
  };
}
