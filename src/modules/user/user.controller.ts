import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserDto } from './dto/user.dto.js';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/')
    addNewUser(@Body() userBody: UserDto) {
        return this.userService.addNewUser(userBody);
    }

    @Get('/:id')
    getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @Get('/')
    getAllUsers() {
        return this.userService.featchAllUsers();
    }

}
