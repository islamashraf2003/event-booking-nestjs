import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class EventDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    capacity?: number;

    @IsNotEmpty()
    @IsDateString()
    startsAt: string;

    @IsOptional()
    @IsDateString()
    endsAt?: string;
}

export class UpdateEventDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    capacity?: number;

    @IsOptional()
    @IsDateString()
    startsAt?: string;

    @IsOptional()
    @IsDateString()
    endsAt?: string;
}
