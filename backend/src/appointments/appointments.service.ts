import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/pagination.dto';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private usersService: UsersService,
    private servicesService: ServicesService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Validate client exists
    const client = await this.usersService.findOne(createAppointmentDto.clientId);
    
    // Validate staff exists if provided
    if (createAppointmentDto.staffId) {
      await this.usersService.findOne(createAppointmentDto.staffId);
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
    const appointment = this.appointmentsRepository.create({
      ...createAppointmentDto,
      dateTime,
      endTime,
      status: AppointmentStatus.PENDING,
    });
    
    return this.appointmentsRepository.save(appointment);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    const [appointments, total] = await this.appointmentsRepository.findAndCount({
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { dateTime: 'DESC' },
      relations: ['client', 'staff', 'service'],
    });

    return new PaginatedResponseDto<Appointment>(appointments, total, paginationDto);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['client', 'staff', 'service'],
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    // If updating staff, validate staff exists
    if (updateAppointmentDto.staffId && updateAppointmentDto.staffId !== appointment.staffId) {
      await this.usersService.findOne(updateAppointmentDto.staffId);
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
    
    // Update appointment
    Object.assign(appointment, {
      ...updateAppointmentDto,
      endTime,
      dateTime: updateAppointmentDto.dateTime ? new Date(updateAppointmentDto.dateTime) : appointment.dateTime,
    });
    
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }

  async findByClient(clientId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    const [appointments, total] = await this.appointmentsRepository.findAndCount({
      where: { clientId },
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { dateTime: 'DESC' },
      relations: ['client', 'staff', 'service'],
    });

    return new PaginatedResponseDto<Appointment>(appointments, total, paginationDto);
  }

  async findByStaff(staffId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    const [appointments, total] = await this.appointmentsRepository.findAndCount({
      where: { staffId },
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { dateTime: 'DESC' },
      relations: ['client', 'staff', 'service'],
    });

    return new PaginatedResponseDto<Appointment>(appointments, total, paginationDto);
  }

  async findByDateRange(startDate: Date, endDate: Date, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    const [appointments, total] = await this.appointmentsRepository.findAndCount({
      where: {
        dateTime: Between(startDate, endDate),
      },
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { dateTime: 'ASC' },
      relations: ['client', 'staff', 'service'],
    });

    return new PaginatedResponseDto<Appointment>(appointments, total, paginationDto);
  }

  private async checkForConflicts(dateTime: Date, endTime: Date, staffId: string, excludeId?: string): Promise<void> {
    if (!staffId) {
      return; // No staff assigned yet, so no conflicts to check
    }
    
    const query = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .where('appointment.staffId = :staffId', { staffId })
      .andWhere(
        '(appointment.dateTime < :endTime AND appointment.endTime > :dateTime)',
        { dateTime, endTime }
      );
    
    if (excludeId) {
      query.andWhere('appointment.id != :excludeId', { excludeId });
    }
    
    const conflictingAppointments = await query.getCount();
    
    if (conflictingAppointments > 0) {
      throw new BadRequestException('The selected time slot conflicts with an existing appointment for this staff member');
    }
  }
}