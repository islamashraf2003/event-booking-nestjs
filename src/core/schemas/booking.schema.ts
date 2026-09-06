
import { Type } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema(
    {
        timestamps: true,
        versionKey: false,
    }
)
export class Booking {

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    user: Types.ObjectId;
    @Prop({
        type: Types.ObjectId,
        ref: 'Event',
        required: true,
    })
    event: Types.ObjectId;

    @Prop({
        required: true,
        min: 1,
    })
    tickets: number;

    @Prop({
        required: true,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    })
    status: string;

}

export const BookingSchema = SchemaFactory.createForClass(Booking);
