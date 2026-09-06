import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { resolveObserveOptions } from './observe.config.js';
import { UserModule } from './modules/user/user.module.js';
import { EventModule } from './modules/event/event.module.js';
import { BookingModule } from './modules/booking/booking.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();
const observeOptions = resolveObserveOptions();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot('mongodb://localhost/event-booking-db'),
    ...(observeOptions ? [ObserveModule.forRoot(observeOptions)] : []),
    UserModule,
    EventModule,
    BookingModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
