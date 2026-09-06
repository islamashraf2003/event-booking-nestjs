import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingController } from './booking.controller.js';
import { BookingService } from './booking.service.js';
import { Booking, BookingSchema } from '../../core/schemas/booking.schema.js';
import { Event, EventSchema } from '../../core/schemas/event.schema.js';
import { User, UserSchema } from '../../core/schemas/user.schemas.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Event.name, schema: EventSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService]
})
export class BookingModule { }
