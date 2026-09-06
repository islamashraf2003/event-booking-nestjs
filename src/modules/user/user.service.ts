import { Injectable, NotFoundException } from '@nestjs/common';
import { UserDto } from './dto/user.dto.js';
import { User } from '../../core/schemas/user.schemas.js';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { retry } from 'rxjs';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name)
    private userModel: Model<User>,) { }


    async addNewUser(userBody: UserDto) {
        const isEmailFound = await this.userModel.findOne({ email: userBody.email });
        if (isEmailFound) {
            return {
                message: 'soory , email is found!',
            };
        }
        const hashedPassword = await bcrypt.hash(userBody.password, SALT_ROUNDS);
        const newUser = await this.userModel.create({
            ...userBody,
            password: hashedPassword,
        });
        const { password, ...userWithoutPassword } = newUser.toObject();
        return {
            message: 'User created successfully',
            data: userWithoutPassword,
        };
    }
    async featchAllUsers() {
        const allUsers = await this.userModel.find();
        return {
            message: 'all users',
            data: allUsers,
        };
    }

    async getUserById(id: string) {
        const user = await this.userModel.findById(id);
        if (!user) {
            return {
                message: "sorry , User not found!",
            }
        }
        const { password, ...userWithoutPassword } = user.toObject();
        return {
            message: 'User fetched successfully',
            data: userWithoutPassword,
        };

    }
}
