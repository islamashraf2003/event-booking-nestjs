import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto, UserDto } from './dto/user.dto.js';
import { User } from '../../core/schemas/user.schemas.js';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthUser } from '../../core/guards/auth.guard.js';
import bcrypt from 'bcrypt';

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
        const { password: _password, ...userWithoutPassword } = newUser.toObject();
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

    async fetchUserById(id: string, currentUser: AuthUser) {
        this.assertSelfOrAdmin(id, currentUser);
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            message: 'user found',
            data: user,
        };
    }

    async updateUser(
        id: string,
        userBody: UpdateUserDto,
        currentUser: AuthUser,
    ) {
        this.assertSelfOrAdmin(id, currentUser);

        const updates: Partial<User> = {};
        if (userBody.name !== undefined) {
            updates.name = userBody.name;
        }
        if (userBody.email !== undefined) {
            updates.email = userBody.email;
        }
        if (userBody.password !== undefined) {
            updates.password = await bcrypt.hash(userBody.password, SALT_ROUNDS);
        }
        if (Object.keys(updates).length === 0) {
            throw new BadRequestException('No fields to update');
        }

        if (userBody.email) {
            const isEmailTaken = await this.userModel.findOne({
                email: userBody.email,
                _id: { $ne: id },
            });
            if (isEmailTaken) {
                throw new ConflictException('Email is already in use');
            }
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return {
            message: 'User updated successfully',
            data: updatedUser,
        };
    }

    async deleteUser(id: string, currentUser: AuthUser) {
        this.assertSelfOrAdmin(id, currentUser);
        const deletedUser = await this.userModel.findByIdAndDelete(id);
        if (!deletedUser) {
            throw new NotFoundException('User not found');
        }

        return {
            message: 'User deleted successfully',
            data: deletedUser,
        };
    }

    private assertSelfOrAdmin(id: string, currentUser: AuthUser) {
        this.assertValidId(id);
        if (currentUser.role !== 'admin' && id !== currentUser.sub) {
            throw new ForbiddenException('You can only access your own account');
        }
    }

    private assertValidId(id: string) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('Invalid user id');
        }
    }
}
