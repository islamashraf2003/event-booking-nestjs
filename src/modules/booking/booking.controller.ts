import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service.js';
import { BookingDto, UpdateBookingDto } from './dto/booking.dto.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import type { AuthUser } from '../../core/guards/auth.guard.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';

@Controller('bookings')
@UseGuards(AuthGuard)
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    @Post('/')
    addNewBooking(
        @Body() bookingBody: BookingDto,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.bookingService.addNewBooking(bookingBody, currentUser);
    }

    @Get('/')
    getAllBookings(@CurrentUser() currentUser: AuthUser) {
        return this.bookingService.fetchAllBookings(currentUser);
    }

    @Get('/:id')
    getBookingById(@Param('id') id: string, @CurrentUser() currentUser: AuthUser) {
        return this.bookingService.fetchBookingById(id, currentUser);
    }

    @Patch('/:id')
    updateBooking(
        @Param('id') id: string,
        @Body() bookingBody: UpdateBookingDto,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.bookingService.updateBooking(id, bookingBody, currentUser);
    }

    @Delete('/:id')
    deleteBooking(@Param('id') id: string, @CurrentUser() currentUser: AuthUser) {
        return this.bookingService.deleteBooking(id, currentUser);
    }

}
