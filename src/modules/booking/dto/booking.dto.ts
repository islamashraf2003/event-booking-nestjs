import { IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, Min } from 'class-validator';

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];

export class BookingDto {
    @IsNotEmpty()
    @IsMongoId()
    event: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    tickets: number;

    @IsOptional()
    @IsIn(BOOKING_STATUSES)
    status?: string;
}

export class UpdateBookingDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    tickets?: number;

    @IsOptional()
    @IsIn(BOOKING_STATUSES)
    status?: string;
}
