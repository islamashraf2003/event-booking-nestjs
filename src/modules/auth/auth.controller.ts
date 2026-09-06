import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RateLimitGuard } from '../../core/guards/rate-limit.guard.js';
import { RateLimit } from '../../core/decorators/rate-limit.decorator.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RateLimitGuard)
    @RateLimit(5, 60000)
    login(@Body() loginBody: LoginDto) {
        return this.authService.login(loginBody);
    }
}
