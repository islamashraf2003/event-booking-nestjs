
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema(
    {
        timestamps: true,
        versionKey: false,
    }
)
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ unique: true, required: true })
    email: string;
    @Prop({ required: true })
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
