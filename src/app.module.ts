import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { resolveObserveOptions } from './observe.config.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

// Distributed tracing, auto-correlated logs, request/job metrics, error
// telemetry, alarms, and more — out of the box. Sign up at
// https://observe.nestjs.com, then set OBSERVE_APP_KEY and OBSERVE_APP_SECRET.
// Without both, the module stays unregistered and nothing is sent.
const observeOptions = resolveObserveOptions();

@Module({
  imports: observeOptions ? [ObserveModule.forRoot(observeOptions)] : [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
