import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/pagination.dto';
import { Appointment } from './appointment.entity';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Appointment has been successfully created',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or scheduling conflict',
  })
  async create(@Body() createAppointmentDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of appointments',
    type: PaginatedResponseDto,
  })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return this.appointmentsService.findAll(paginationDto);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get appointments by client ID' })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of appointments for the specified client',
    type: PaginatedResponseDto,
  })
  async findByClient(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Appointment>> {
    return this.appointmentsService.findByClient(clientId, paginationDto);
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Get appointments by staff ID' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of appointments for the specified staff member',
    type: PaginatedResponseDto,
  })
  async findByStaff(
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Appointment>> {
    return this.appointmentsService.findByStaff(staffId, paginationDto);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get appointments within a date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO format)', required: true })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO format)', required: true })
  @ApiQuery({ type: PaginationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of appointments within the specified date range',
    type: PaginatedResponseDto,
  })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Appointment>> {
    return this.appointmentsService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
      paginationDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment found',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment has been successfully updated',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or scheduling conflict',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Appointment has been successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.appointmentsService.remove(id);
  }
}
