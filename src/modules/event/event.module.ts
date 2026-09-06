import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller.js';
import { EventService } from './event.service.js';
import { Event, EventSchema } from '../../core/schemas/event.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule { }
