import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * Create a new appointment (multi-tenant - filtered by doctorId)
   */
  async create(createAppointmentDto: CreateAppointmentDto, doctorId: string): Promise<Appointment> {
    // Verify patient exists and belongs to this doctor
    await this.patientsService.findOne(createAppointmentDto.patientId, doctorId);

    // Parse date string as local date without timezone conversion
    const [year, month, day] = createAppointmentDto.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      date: localDate,
      doctorId, // Set the current doctor's ID
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Load patient relation for response
    return await this.appointmentRepository.findOne({
      where: { id: savedAppointment.id },
      relations: ['patient'],
    });
  }

  /**
   * Find all appointments with filters (multi-tenant - filtered by doctorId)
   */
  async findAll(queryDto: QueryAppointmentDto, doctorId: string) {
    const { date, patientId, status, startDate, endDate, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .where('appointment.doctorId = :doctorId', { doctorId }); // Filter by doctor

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
   * Find appointment by ID (multi-tenant - filtered by doctorId)
   */
  async findOne(id: string, doctorId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, doctorId }, // Ensure appointment belongs to this doctor
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
   * Find appointments by patient ID (multi-tenant - filtered by doctorId)
   */
  async findByPatient(patientId: string, doctorId: string) {
    // Verify patient belongs to this doctor
    await this.patientsService.findOne(patientId, doctorId);

    const appointments = await this.appointmentRepository.find({
      where: { patientId, doctorId },
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
   * Find appointments by date (multi-tenant - filtered by doctorId)
   */
  async findByDate(date: string, doctorId: string) {
    const appointments = await this.appointmentRepository.find({
      where: { date: new Date(date), doctorId },
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
   * Update an appointment (multi-tenant - filtered by doctorId)
   */
  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, doctorId: string): Promise<Appointment> {
    const appointment = await this.findOne(id, doctorId); // Verify ownership

    if (updateAppointmentDto.date) {
      // Parse date string as local date without timezone conversion
      const [year, month, day] = updateAppointmentDto.date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      updateAppointmentDto.date = localDate.toISOString();
    }

    if (updateAppointmentDto.patientId) {
      // Verify new patient belongs to this doctor
      await this.patientsService.findOne(updateAppointmentDto.patientId, doctorId);
    }

    Object.assign(appointment, updateAppointmentDto);
    const updated = await this.appointmentRepository.save(appointment);

    return await this.findOne(updated.id, doctorId);
  }

  /**
   * Delete an appointment (multi-tenant - filtered by doctorId)
   */
  async remove(id: string, doctorId: string): Promise<void> {
    const appointment = await this.findOne(id, doctorId); // Verify ownership
    await this.appointmentRepository.remove(appointment);
  }
}
