import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Booking } from '../../core/schemas/booking.schema.js';
import { Event } from '../../core/schemas/event.schema.js';
import { User } from '../../core/schemas/user.schemas.js';
import { AuthUser } from '../../core/guards/auth.guard.js';
import { BookingDto, UpdateBookingDto } from './dto/booking.dto.js';

const ACTIVE_STATUSES = ['pending', 'confirmed'];

const POPULATE = [
    { path: 'user', select: 'name email' },
    { path: 'event', select: 'title startsAt location' },
];

@Injectable()
export class BookingService {
    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<Booking>,
        @InjectModel(Event.name) private eventModel: Model<Event>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async addNewBooking(bookingBody: BookingDto, currentUser: AuthUser) {
        // a token outlives the account it was issued for, so re-check
        const isUserFound = await this.userModel.exists({ _id: currentUser.sub });
        if (!isUserFound) {
            throw new UnauthorizedException('User no longer exists');
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
            user: currentUser.sub,        // from the token, not the request body
            event: bookingBody.event,
            tickets: bookingBody.tickets,
            status,
        });

        return {
            message: 'Booking created successfully',
            data: newBooking,
        };
    }

    async fetchAllBookings(currentUser: AuthUser) {
        const filter = this.isAdmin(currentUser) ? {} : { user: currentUser.sub };
        const allBookings = await this.bookingModel
            .find(filter)
            .populate(POPULATE)
            .sort({ createdAt: -1 });

        return {
            message: 'all bookings',
            data: allBookings,
        };
    }

    async fetchBookingById(id: string, currentUser: AuthUser) {
        const booking = await this.findBookingOrFail(id);
        this.assertOwnerOrAdmin(booking, currentUser);
        await booking.populate(POPULATE);

        return {
            message: 'booking found',
            data: booking,
        };
    }

    async updateBooking(
        id: string,
        bookingBody: UpdateBookingDto,
        currentUser: AuthUser,
    ) {
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

        const booking = await this.findBookingOrFail(id);
        this.assertOwnerOrAdmin(booking, currentUser);

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
            .populate(POPULATE);

        return {
            message: 'Booking updated successfully',
            data: updatedBooking,
        };
    }

    async deleteBooking(id: string, currentUser: AuthUser) {
        const booking = await this.findBookingOrFail(id);
        this.assertOwnerOrAdmin(booking, currentUser);
        await this.bookingModel.findByIdAndDelete(id);

        return {
            message: 'Booking deleted successfully',
            data: booking,
        };
    }

    private async findBookingOrFail(id: string) {
        this.assertValidId(id);
        const booking = await this.bookingModel.findById(id);
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    private isAdmin(currentUser: AuthUser) {
        return currentUser.role === 'admin';
    }

    private assertOwnerOrAdmin(booking: Booking, currentUser: AuthUser) {
        if (this.isAdmin(currentUser)) {
            return;
        }
        if (booking.user.toString() !== currentUser.sub) {
            throw new ForbiddenException('This booking belongs to another user');
        }
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
