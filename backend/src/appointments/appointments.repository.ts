import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { BaseRepository } from '../common/base.repository';
import { PaginationDto, PaginatedResponseDto } from '../common/pagination.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsRepository extends BaseRepository<Appointment> {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {
    super(appointmentsRepository);
  }

  async create(createDto: any): Promise<Appointment> {
    const entity = this.appointmentsRepository.create(createDto);
    const savedEntity = await this.appointmentsRepository.save(entity);
    return Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;
  }

  async findOne(id: string): Promise<Appointment> {
    return super.findOne(id, { relations: ['client', 'staff', 'service'] });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return super.findAll(paginationDto, {
      order: { dateTime: 'DESC' },
      relations: ['client', 'staff', 'service'],
    });
  }

  async findByClient(clientId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return this.findBy(
      { clientId },
      paginationDto,
      {
        order: { dateTime: 'DESC' },
        relations: ['client', 'staff', 'service'],
      }
    );
  }

  async findByStaff(staffId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return this.findBy(
      { staffId },
      paginationDto,
      {
        order: { dateTime: 'DESC' },
        relations: ['client', 'staff', 'service'],
      }
    );
  }

  async findByDateRange(startDate: Date, endDate: Date, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Appointment>> {
    return this.findBy(
      { dateTime: Between(startDate, endDate) },
      paginationDto,
      {
        order: { dateTime: 'ASC' },
        relations: ['client', 'staff', 'service'],
      }
    );
  }

  async update(id: string, updateDto: any): Promise<Appointment> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateDto);
    const savedEntity = await this.appointmentsRepository.save(entity);
    return Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;
  }

  async checkForConflicts(dateTime: Date, endTime: Date, staffId: string, excludeId?: string): Promise<void> {
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
