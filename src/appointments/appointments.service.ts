import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly patientsService: PatientsService,
  ) {}

  /**
   * Create a new appointment
   */
  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Verify patient exists
    const patient = await this.patientsService.findOne(createAppointmentDto.patientId);

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      date: new Date(createAppointmentDto.date),
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Load patient relation for response
    return await this.appointmentRepository.findOne({
      where: { id: savedAppointment.id },
      relations: ['patient'],
    });
  }

  /**
   * Find all appointments with filters
   */
  async findAll(queryDto: QueryAppointmentDto) {
    const {
      date,
      patientId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient');

    if (date) {
      queryBuilder.andWhere('appointment.date = :date', {
        date: new Date(date).toISOString().split('T')[0],
      });
    }

    if (patientId) {
      queryBuilder.andWhere('appointment.patientId = :patientId', { patientId });
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('appointment.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate).toISOString().split('T')[0],
        endDate: new Date(endDate).toISOString().split('T')[0],
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('appointment.date', 'ASC')
      .addOrderBy('appointment.time', 'ASC')
      .getManyAndCount();

    // Transform data to include patientName
    const transformedData = data.map((apt) => ({
      ...apt,
      patientName: apt.patient?.name || '',
    }));

    return {
      data: transformedData,
      total,
      page,
      limit,
    };
  }

  /**
   * Find appointment by ID
   */
  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return {
      ...appointment,
      patientName: appointment.patient?.name || '',
    } as any;
  }

  /**
   * Find appointments by patient ID
   */
  async findByPatient(patientId: string) {
    const appointments = await this.appointmentRepository.find({
      where: { patientId },
      relations: ['patient'],
      order: { date: 'ASC', time: 'ASC' },
    });

    return {
      data: appointments.map((apt) => ({
        ...apt,
        patientName: apt.patient?.name || '',
      })),
    };
  }

  /**
   * Find appointments by date
   */
  async findByDate(date: string) {
    const appointments = await this.appointmentRepository.find({
      where: { date: new Date(date) },
      relations: ['patient'],
      order: { time: 'ASC' },
    });

    return {
      data: appointments.map((apt) => ({
        ...apt,
        patientName: apt.patient?.name || '',
      })),
    };
  }

  /**
   * Update an appointment
   */
  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    if (updateAppointmentDto.date) {
      updateAppointmentDto.date = new Date(updateAppointmentDto.date).toISOString();
    }

    if (updateAppointmentDto.patientId) {
      await this.patientsService.findOne(updateAppointmentDto.patientId);
    }

    Object.assign(appointment, updateAppointmentDto);
    const updated = await this.appointmentRepository.save(appointment);

    return await this.findOne(updated.id);
  }

  /**
   * Delete an appointment
   */
  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }
}

