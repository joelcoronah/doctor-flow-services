import { DataSource } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';

export async function seedPatients(dataSource: DataSource): Promise<void> {
  const patientRepository = dataSource.getRepository(Patient);

  const patients = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0101',
      dateOfBirth: new Date('1985-05-15'),
      address: '123 Main St, New York, NY 10001',
      notes: 'Regular patient, prefers morning appointments',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0102',
      dateOfBirth: new Date('1990-08-22'),
      address: '456 Oak Ave, Los Angeles, CA 90001',
      notes: 'Allergic to penicillin',
    },
    {
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      phone: '+1-555-0103',
      dateOfBirth: new Date('1978-12-10'),
      address: '789 Pine Rd, Chicago, IL 60601',
      notes: 'High blood pressure, monitor regularly',
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1-555-0104',
      dateOfBirth: new Date('1995-03-18'),
      address: '321 Elm St, Houston, TX 77001',
      notes: 'New patient, first visit scheduled',
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1-555-0105',
      dateOfBirth: new Date('1982-07-25'),
      address: '654 Maple Dr, Phoenix, AZ 85001',
      notes: 'Prefers afternoon appointments',
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1-555-0106',
      dateOfBirth: new Date('1988-11-30'),
      address: '987 Cedar Ln, Philadelphia, PA 19101',
      notes: 'Follow-up required after last visit',
    },
    {
      name: 'David Martinez',
      email: 'david.martinez@example.com',
      phone: '+1-555-0107',
      dateOfBirth: new Date('1992-02-14'),
      address: '147 Birch Way, San Antonio, TX 78201',
      notes: 'Regular checkups every 6 months',
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      phone: '+1-555-0108',
      dateOfBirth: new Date('1987-09-05'),
      address: '258 Spruce Ct, San Diego, CA 92101',
      notes: 'Insurance: Blue Cross Blue Shield',
    },
    {
      name: 'James Taylor',
      email: 'james.taylor@example.com',
      phone: '+1-555-0109',
      dateOfBirth: new Date('1975-04-20'),
      address: '369 Willow St, Dallas, TX 75201',
      notes: 'Diabetic, requires special attention',
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '+1-555-0110',
      dateOfBirth: new Date('1993-06-12'),
      address: '741 Ash Blvd, San Jose, CA 95101',
      notes: 'Pregnant, high priority appointments',
    },
  ];

  for (const patientData of patients) {
    const existingPatient = await patientRepository.findOne({
      where: { email: patientData.email },
    });

    if (!existingPatient) {
      const patient = patientRepository.create(patientData);
      await patientRepository.save(patient);
      console.log(`✓ Seeded patient: ${patientData.name}`);
    } else {
      console.log(`⊘ Patient already exists: ${patientData.name}`);
    }
  }
}

