import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Event } from '../../core/schemas/event.schema.js';
import { EventDto, UpdateEventDto } from './dto/event.dto.js';

@Injectable()
export class EventService {
    constructor(@InjectModel(Event.name)
    private eventModel: Model<Event>,) { }

    async addNewEvent(eventBody: EventDto) {
        const startsAt = new Date(eventBody.startsAt);
        const endsAt = eventBody.endsAt ? new Date(eventBody.endsAt) : undefined;
        this.assertValidRange(startsAt, endsAt);

        const newEvent = await this.eventModel.create({
            ...eventBody,
            startsAt,
            endsAt,
        });

        return {
            message: 'Event created successfully',
            data: newEvent,
        };
    }

    async fetchAllEvents() {
        const allEvents = await this.eventModel.find().sort({ startsAt: 1 });

        return {
            message: 'all events',
            data: allEvents,
        };
    }

    async fetchEventById(id: string) {
        const event = await this.findEventOrFail(id);

        return {
            message: 'event found',
            data: event,
        };
    }

    async updateEvent(id: string, eventBody: UpdateEventDto) {
        const event = await this.findEventOrFail(id);

        const updates: Partial<Event> = {};
        if (eventBody.title !== undefined) {
            updates.title = eventBody.title;
        }
        if (eventBody.description !== undefined) {
            updates.description = eventBody.description;
        }
        if (eventBody.location !== undefined) {
            updates.location = eventBody.location;
        }
        if (eventBody.capacity !== undefined) {
            updates.capacity = eventBody.capacity;
        }
        if (eventBody.startsAt !== undefined) {
            updates.startsAt = new Date(eventBody.startsAt);
        }
        if (eventBody.endsAt !== undefined) {
            updates.endsAt = new Date(eventBody.endsAt);
        }
        if (Object.keys(updates).length === 0) {
            throw new BadRequestException('No fields to update');
        }

        this.assertValidRange(
            updates.startsAt ?? event.startsAt,
            updates.endsAt ?? event.endsAt,
        );

        const updatedEvent = await this.eventModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });
        if (!updatedEvent) {
            throw new NotFoundException('Event not found');
        }

        return {
            message: 'Event updated successfully',
            data: updatedEvent,
        };
    }

    async deleteEvent(id: string) {
        this.assertValidId(id);
        const deletedEvent = await this.eventModel.findByIdAndDelete(id);
        if (!deletedEvent) {
            throw new NotFoundException('Event not found');
        }

        return {
            message: 'Event deleted successfully',
            data: deletedEvent,
        };
    }

    private async findEventOrFail(id: string) {
        this.assertValidId(id);
        const event = await this.eventModel.findById(id);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    private assertValidRange(startsAt: Date, endsAt?: Date) {
        if (endsAt && endsAt <= startsAt) {
            throw new BadRequestException('endsAt must be after startsAt');
        }
    }

    private assertValidId(id: string) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('Invalid event id');
        }
    }
}
