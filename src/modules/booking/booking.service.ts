import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Booking } from '../../core/schemas/booking.schema.js';
import { Event } from '../../core/schemas/event.schema.js';
import { User } from '../../core/schemas/user.schemas.js';
import { BookingDto, UpdateBookingDto } from './dto/booking.dto.js';

const ACTIVE_STATUSES = ['pending', 'confirmed'];

@Injectable()
export class BookingService {
    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<Booking>,
        @InjectModel(Event.name) private eventModel: Model<Event>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async addNewBooking(bookingBody: BookingDto) {
        const isUserFound = await this.userModel.exists({ _id: bookingBody.user });
        if (!isUserFound) {
            throw new NotFoundException('User not found');
        }

        const event = await this.eventModel.findById(bookingBody.event);
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const status = bookingBody.status ?? 'pending';
        if (ACTIVE_STATUSES.includes(status)) {
            await this.assertSeatsAvailable(event, bookingBody.tickets);
        }

        const newBooking = await this.bookingModel.create({
            user: bookingBody.user,
            event: bookingBody.event,
            tickets: bookingBody.tickets,
            status,
        });

        return {
            message: 'Booking created successfully',
            data: newBooking,
        };
    }

    async fetchAllBookings() {
        const allBookings = await this.bookingModel
            .find()
            .populate('user', 'name email')
            .populate('event', 'title startsAt location')
            .sort({ createdAt: -1 });

        return {
            message: 'all bookings',
            data: allBookings,
        };
    }

    async fetchBookingById(id: string) {
        this.assertValidId(id);
        const booking = await this.bookingModel
            .findById(id)
            .populate('user', 'name email')
            .populate('event', 'title startsAt location');
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return {
            message: 'booking found',
            data: booking,
        };
    }

    async updateBooking(id: string, bookingBody: UpdateBookingDto) {
        this.assertValidId(id);

        const updates: Partial<Booking> = {};
        if (bookingBody.tickets !== undefined) {
            updates.tickets = bookingBody.tickets;
        }
        if (bookingBody.status !== undefined) {
            updates.status = bookingBody.status;
        }
        if (Object.keys(updates).length === 0) {
            throw new BadRequestException('No fields to update');
        }

        const booking = await this.bookingModel.findById(id);
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        const tickets = updates.tickets ?? booking.tickets;
        const status = updates.status ?? booking.status;
        if (ACTIVE_STATUSES.includes(status)) {
            const event = await this.eventModel.findById(booking.event);
            if (!event) {
                throw new NotFoundException('Event not found');
            }
            await this.assertSeatsAvailable(event, tickets, booking._id);
        }

        const updatedBooking = await this.bookingModel
            .findByIdAndUpdate(id, updates, { new: true, runValidators: true })
            .populate('user', 'name email')
            .populate('event', 'title startsAt location');

        return {
            message: 'Booking updated successfully',
            data: updatedBooking,
        };
    }

    async deleteBooking(id: string) {
        this.assertValidId(id);
        const deletedBooking = await this.bookingModel.findByIdAndDelete(id);
        if (!deletedBooking) {
            throw new NotFoundException('Booking not found');
        }

        return {
            message: 'Booking deleted successfully',
            data: deletedBooking,
        };
    }

    private async assertSeatsAvailable(
        event: Event & { _id: Types.ObjectId },
        tickets: number,
        excludeBookingId?: Types.ObjectId,
    ) {
        if (!event.capacity) {
            return;
        }

        const activeBookings = await this.bookingModel.find({
            event: event._id,
            status: { $in: ACTIVE_STATUSES },
            ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
        });
        const booked = activeBookings.reduce((sum, item) => sum + item.tickets, 0);
        const seatsLeft = event.capacity - booked;

        if (tickets > seatsLeft) {
            throw new ConflictException(
                `Not enough seats, only ${seatsLeft} left for this event`,
            );
        }
    }

    private assertValidId(id: string) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('Invalid booking id');
        }
    }
}
