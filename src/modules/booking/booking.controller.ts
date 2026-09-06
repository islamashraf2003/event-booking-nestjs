import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BookingService } from './booking.service.js';
import { BookingDto, UpdateBookingDto } from './dto/booking.dto.js';

@Controller('bookings')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    @Post('/')
    addNewBooking(@Body() bookingBody: BookingDto) {
        return this.bookingService.addNewBooking(bookingBody);
    }

    @Get('/')
    getAllBookings() {
        return this.bookingService.fetchAllBookings();
    }

    @Get('/:id')
    getBookingById(@Param('id') id: string) {
        return this.bookingService.fetchBookingById(id);
    }

    @Patch('/:id')
    updateBooking(@Param('id') id: string, @Body() bookingBody: UpdateBookingDto) {
        return this.bookingService.updateBooking(id, bookingBody);
    }

    @Delete('/:id')
    deleteBooking(@Param('id') id: string) {
        return this.bookingService.deleteBooking(id);
    }

}
