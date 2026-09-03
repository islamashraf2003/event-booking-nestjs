
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema(
    {
        timestamps: true,
        versionKey: false,
    }
)
export class Event {
    @Prop({ required: true })
    title: string;
    @Prop()
    description: string;
    @Prop()
    location: string;
    @Prop()
    capacity: number;
    @Prop({ required: true })
    startsAt: Date;
    @Prop()
    endsAt: Date;

}

export const EventSchema = SchemaFactory.createForClass(Event);
