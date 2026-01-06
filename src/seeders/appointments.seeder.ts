import { DataSource } from 'typeorm';
import { Appointment, AppointmentType, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';

export async function seedAppointments(dataSource: DataSource): Promise<void> {
  const appointmentRepository = dataSource.getRepository(Appointment);
  const patientRepository = dataSource.getRepository(Patient);

  // Get all patients
  const patients = await patientRepository.find();
  if (patients.length === 0) {
    console.log('⚠ No patients found. Please seed patients first.');
    return;
  }

  const appointments = [
    {
      patientEmail: 'john.doe@example.com',
      date: new Date('2024-12-20'),
      time: '09:00:00',
      duration: 30,
      type: AppointmentType.CHECKUP,
      status: AppointmentStatus.SCHEDULED,
      notes: 'Regular annual checkup',
    },
    {
      patientEmail: 'jane.smith@example.com',
      date: new Date('2024-12-21'),
      time: '10:30:00',
      duration: 45,
      type: AppointmentType.CLEANING,
      status: AppointmentStatus.CONFIRMED,
      notes: 'Deep cleaning appointment',
    },
    {
      patientEmail: 'robert.johnson@example.com',
      date: new Date('2024-12-22'),
      time: '14:00:00',
      duration: 60,
      type: AppointmentType.PROCEDURE,
      status: AppointmentStatus.SCHEDULED,
      notes: 'Root canal procedure',
    },
    {
      patientEmail: 'emily.davis@example.com',
      date: new Date('2024-12-18'),
      time: '11:00:00',
      duration: 30,
      type: AppointmentType.CONSULTATION,
      status: AppointmentStatus.COMPLETED,
      notes: 'Initial consultation completed',
    },
    {
      patientEmail: 'michael.brown@example.com',
      date: new Date('2024-12-19'),
      time: '15:30:00',
      duration: 30,
      type: AppointmentType.FOLLOW_UP,
      status: AppointmentStatus.CONFIRMED,
      notes: 'Follow-up from previous treatment',
    },
    {
      patientEmail: 'sarah.wilson@example.com',
      date: new Date('2024-12-23'),
      time: '09:30:00',
      duration: 30,
      type: AppointmentType.CHECKUP,
      status: AppointmentStatus.SCHEDULED,
      notes: 'Routine checkup',
    },
    {
      patientEmail: 'david.martinez@example.com',
      date: new Date('2024-12-20'),
      time: '13:00:00',
      duration: 45,
      type: AppointmentType.CLEANING,
      status: AppointmentStatus.SCHEDULED,
      notes: 'Regular cleaning',
    },
    {
      patientEmail: 'lisa.anderson@example.com',
      date: new Date('2024-12-17'),
      time: '10:00:00',
      duration: 30,
      type: AppointmentType.EMERGENCY,
      status: AppointmentStatus.COMPLETED,
      notes: 'Emergency tooth extraction',
    },
    {
      patientEmail: 'james.taylor@example.com',
      date: new Date('2024-12-24'),
      time: '08:30:00',
      duration: 60,
      type: AppointmentType.PROCEDURE,
      status: AppointmentStatus.SCHEDULED,
      notes: 'Crown placement',
    },
    {
      patientEmail: 'maria.garcia@example.com',
      date: new Date('2024-12-21'),
      time: '14:30:00',
      duration: 30,
      type: AppointmentType.CONSULTATION,
      status: AppointmentStatus.CONFIRMED,
      notes: 'Prenatal dental consultation',
    },
    {
      patientEmail: 'john.doe@example.com',
      date: new Date('2025-01-15'),
      time: '09:00:00',
      duration: 30,
      type: AppointmentType.FOLLOW_UP,
      status: AppointmentStatus.SCHEDULED,
      notes: 'Follow-up appointment',
    },
    {
      patientEmail: 'jane.smith@example.com',
      date: new Date('2025-01-20'),
      time: '10:00:00',
      duration: 30,
      type: AppointmentType.CHECKUP,
      status: AppointmentStatus.SCHEDULED,
      notes: 'Next checkup scheduled',
    },
  ];

  for (const appointmentData of appointments) {
    const patient = await patientRepository.findOne({
      where: { email: appointmentData.patientEmail },
    });

    if (!patient) {
      console.log(`⚠ Patient not found: ${appointmentData.patientEmail}`);
      continue;
    }

    // Check if appointment already exists
    const existingAppointment = await appointmentRepository.findOne({
      where: {
        patientId: patient.id,
        date: appointmentData.date,
        time: appointmentData.time,
      },
    });

    if (!existingAppointment) {
      const appointment = appointmentRepository.create({
        ...appointmentData,
        patientId: patient.id,
      });
      await appointmentRepository.save(appointment);
      console.log(`✓ Seeded appointment for ${patient.name} on ${appointmentData.date.toISOString().split('T')[0]}`);
    } else {
      console.log(`⊘ Appointment already exists for ${patient.name}`);
    }
  }
}

