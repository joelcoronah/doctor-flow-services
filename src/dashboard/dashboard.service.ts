import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { AppointmentStatus } from '../appointments/entities/appointment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Today's appointments
    const todayAppointments = await this.appointmentRepository.count({
      where: {
        date: Between(today, tomorrow),
      },
    });

    // This week's appointments
    const weekAppointments = await this.appointmentRepository.count({
      where: {
        date: Between(weekStart, weekEnd),
      },
    });

    // Total patients
    const totalPatients = await this.patientRepository.count();

    // Pending follow-ups (appointments with status 'scheduled' or 'confirmed' in the future)
    const pendingFollowUps = await this.appointmentRepository.count({
      where: [
        {
          status: AppointmentStatus.SCHEDULED,
          date: Between(today, new Date('2099-12-31')),
        },
        {
          status: AppointmentStatus.CONFIRMED,
          date: Between(today, new Date('2099-12-31')),
        },
      ],
    });

    return {
      todayAppointments,
      weekAppointments,
      totalPatients,
      pendingFollowUps,
    };
  }
}

