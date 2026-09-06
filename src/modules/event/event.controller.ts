import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EventService } from './event.service.js';
import { EventDto, UpdateEventDto } from './dto/event.dto.js';

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post('/')
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
    updateEvent(@Param('id') id: string, @Body() eventBody: UpdateEventDto) {
        return this.eventService.updateEvent(id, eventBody);
    }

    @Delete('/:id')
    deleteEvent(@Param('id') id: string) {
        return this.eventService.deleteEvent(id);
    }

}
