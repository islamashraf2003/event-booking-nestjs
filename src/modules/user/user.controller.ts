import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UpdateUserDto, UserDto } from './dto/user.dto.js';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('/')
    addNewUser(@Body() userBody: UserDto) {
        return this.userService.addNewUser(userBody);
    }

    @Get('/')
    getAllUsers() {
        return this.userService.featchAllUsers();
    }

    @Get('/:id')
    getUserById(@Param('id') id: string) {
        return this.userService.fetchUserById(id);
    }

    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() userBody: UpdateUserDto) {
        return this.userService.updateUser(id, userBody);
    }

    @Delete('/:id')
    deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }

}
