import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EventService } from './event.service.js';
import { EventDto, UpdateEventDto } from './dto/event.dto.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { Roles } from '../../core/decorators/roles.decorator.js';

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post('/')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    addNewEvent(@Body() eventBody: EventDto) {
        return this.eventService.addNewEvent(eventBody);
    }

    @Get('/')
    getAllEvents() {
        return this.eventService.fetchAllEvents();
    }

    @Get('/:id')
    getEventById(@Param('id') id: string) {
        return this.eventService.fetchEventById(id);
    }

    @Patch('/:id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    updateEvent(@Param('id') id: string, @Body() eventBody: UpdateEventDto) {
        return this.eventService.updateEvent(id, eventBody);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    deleteEvent(@Param('id') id: string) {
        return this.eventService.deleteEvent(id);
    }

}
