import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../../core/schemas/user.schemas.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    async login(loginBody: LoginDto) {
        const user = await this.userModel
            .findOne({ email: loginBody.email })
            .select('+password');
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordCorrect = await bcrypt.compare(
            loginBody.password,
            user.password,
        );
        if (!isPasswordCorrect) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = await this.jwtService.signAsync({
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return {
            message: 'Logged in successfully',
            data: {
                token,
                user: { _id: user._id, name: user.name, email: user.email, role: user.role },
            },
        };
    }
}
