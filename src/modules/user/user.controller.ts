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
import { UserService } from './user.service.js';
import { UpdateUserDto, UserDto } from './dto/user.dto.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import type { AuthUser } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/')
    addNewUser(@Body() userBody: UserDto) {
        return this.userService.addNewUser(userBody);
    }

    @Get('/')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    getAllUsers() {
        return this.userService.featchAllUsers();
    }

    @Get('/:id')
    @UseGuards(AuthGuard)
    getUserById(@Param('id') id: string, @CurrentUser() currentUser: AuthUser) {
        return this.userService.fetchUserById(id, currentUser);
    }

    @Patch('/:id')
    @UseGuards(AuthGuard)
    updateUser(
        @Param('id') id: string,
        @Body() userBody: UpdateUserDto,
        @CurrentUser() currentUser: AuthUser,
    ) {
        return this.userService.updateUser(id, userBody, currentUser);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard)
    deleteUser(@Param('id') id: string, @CurrentUser() currentUser: AuthUser) {
        return this.userService.deleteUser(id, currentUser);
    }

}
