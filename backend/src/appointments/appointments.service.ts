import { Injectable } from '@nestjs/common';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { PaginationDto, PaginatedResponseDto } from '../common';
import { ServicesService } from '../services/services.service';
import { AppointmentsRepository } from './appointments.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AppointmentsService {
  constructor(
    private appointmentsRepository: AppointmentsRepository,
    private usersRepository: UsersRepository,
    private servicesService: ServicesService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Validate client exists
    const client = await this.usersRepository.findOne(createAppointmentDto.clientId);

    // Validate staff exists if provided
    if (createAppointmentDto.staffId) {
      await this.usersRepository.findOne(createAppointmentDto.staffId);
    }

    // Validate service exists and get duration
    const service = await this.servicesService.findOne(createAppointmentDto.serviceId);

    // Calculate end time based on service duration
    const dateTime = new Date(createAppointmentDto.dateTime);
    const endTime = new Date(dateTime);
    endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);

    // Check for scheduling conflicts
    await this.checkForConflicts(dateTime, endTime, createAppointmentDto.staffId);

    // Create appointment
    return this.appointmentsRepository.create({
      ...createAppointmentDto,
      dateTime,
      endTime,
      status: AppointmentStatus.PENDING,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return this.appointmentsRepository.findAll(paginationDto);
  }

  async findOne(id: string): Promise<Appointment> {
    return this.appointmentsRepository.findOne(id);
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // If updating staff, validate staff exists
    if (updateAppointmentDto.staffId && updateAppointmentDto.staffId !== appointment.staffId) {
      await this.usersRepository.findOne(updateAppointmentDto.staffId);
    }

    // If updating service, validate service exists and recalculate end time
    let endTime = appointment.endTime;
    if (updateAppointmentDto.serviceId && updateAppointmentDto.serviceId !== appointment.serviceId) {
      const service = await this.servicesService.findOne(updateAppointmentDto.serviceId);
      const dateTime = updateAppointmentDto.dateTime 
        ? new Date(updateAppointmentDto.dateTime) 
        : appointment.dateTime;

      endTime = new Date(dateTime);
      endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);
    } else if (updateAppointmentDto.dateTime) {
      // If only updating date/time, recalculate end time based on existing service
      const dateTime = new Date(updateAppointmentDto.dateTime);
      const service = await this.servicesService.findOne(appointment.serviceId);

      endTime = new Date(dateTime);
      endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);
    }

    // Check for scheduling conflicts if date/time or staff is changing
    if (
      (updateAppointmentDto.dateTime && updateAppointmentDto.dateTime !== appointment.dateTime.toISOString()) ||
      (updateAppointmentDto.staffId && updateAppointmentDto.staffId !== appointment.staffId)
    ) {
      const dateTime = updateAppointmentDto.dateTime 
        ? new Date(updateAppointmentDto.dateTime) 
        : appointment.dateTime;
      const staffId = updateAppointmentDto.staffId || appointment.staffId;

      await this.checkForConflicts(dateTime, endTime, staffId, id);
    }

    // Update appointment with calculated values
    const updatedAppointmentData = {
      ...updateAppointmentDto,
      endTime,
      dateTime: updateAppointmentDto.dateTime ? new Date(updateAppointmentDto.dateTime) : appointment.dateTime,
    };

    return this.appointmentsRepository.update(id, updatedAppointmentData);
  }

  async remove(id: string): Promise<void> {
    await this.appointmentsRepository.remove(id);
  }

  async findByClient(clientId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return this.appointmentsRepository.findByClient(clientId, paginationDto);
  }

  async findByStaff(staffId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return this.appointmentsRepository.findByStaff(staffId, paginationDto);
  }

  async findByDateRange(startDate: Date, endDate: Date, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return this.appointmentsRepository.findByDateRange(startDate, endDate, paginationDto);
  }

  private async checkForConflicts(dateTime: Date, endTime: Date, staffId: string, excludeId?: string): Promise<void> {
    await this.appointmentsRepository.checkForConflicts(dateTime, endTime, staffId, excludeId);
  }
}
