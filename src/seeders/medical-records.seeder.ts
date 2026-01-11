import { DataSource } from 'typeorm';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';

export async function seedMedicalRecords(dataSource: DataSource): Promise<void> {
  const medicalRecordRepository = dataSource.getRepository(MedicalRecord);
  const patientRepository = dataSource.getRepository(Patient);
  const userRepository = dataSource.getRepository(User);

  // Get default doctor/admin user for medical records
  const defaultDoctor = await userRepository.findOne({
    where: { email: 'admin@docflow.com' }
  });
  
  if (!defaultDoctor) {
    console.log('⚠ No default doctor found. Please run migration first.');
    return;
  }

  // Get all patients
  const patients = await patientRepository.find();
  if (patients.length === 0) {
    console.log('⚠ No patients found. Please seed patients first.');
    return;
  }

  const medicalRecords = [
    {
      patientEmail: 'john.doe@example.com',
      date: new Date('2024-11-15'),
      diagnosis: 'Cavity in upper left molar',
      treatment: 'Filled cavity with composite resin. Patient advised to maintain good oral hygiene.',
      notes: 'Patient responded well to treatment. No complications.',
      attachments: [],
    },
    {
      patientEmail: 'jane.smith@example.com',
      date: new Date('2024-10-20'),
      diagnosis: 'Gingivitis',
      treatment: 'Deep cleaning performed. Prescribed antimicrobial mouthwash.',
      notes: 'Patient has history of gum disease. Regular cleanings recommended every 3 months.',
      attachments: [],
    },
    {
      patientEmail: 'robert.johnson@example.com',
      date: new Date('2024-09-10'),
      diagnosis: 'Root canal infection',
      treatment: 'Root canal therapy completed. Crown recommended for protection.',
      notes: 'Patient has high blood pressure. Monitored during procedure. All vital signs stable.',
      attachments: [],
    },
    {
      patientEmail: 'emily.davis@example.com',
      date: new Date('2024-12-18'),
      diagnosis: 'Initial consultation - healthy teeth',
      treatment: 'Comprehensive examination. X-rays taken. No issues found.',
      notes: 'New patient. Educated on proper oral hygiene practices.',
      attachments: [],
    },
    {
      patientEmail: 'michael.brown@example.com',
      date: new Date('2024-11-05'),
      diagnosis: 'Tooth sensitivity',
      treatment: 'Applied desensitizing treatment. Recommended sensitive toothpaste.',
      notes: 'Patient reports sensitivity to hot and cold. Treatment effective.',
      attachments: [],
    },
    {
      patientEmail: 'sarah.wilson@example.com',
      date: new Date('2024-10-15'),
      diagnosis: 'Chipped front tooth',
      treatment: 'Dental bonding performed to restore tooth shape and function.',
      notes: 'Follow-up required to check bonding integrity.',
      attachments: [],
    },
    {
      patientEmail: 'david.martinez@example.com',
      date: new Date('2024-09-25'),
      diagnosis: 'Routine cleaning - no issues',
      treatment: 'Professional cleaning and fluoride treatment.',
      notes: 'Patient maintains excellent oral hygiene. Continue current routine.',
      attachments: [],
    },
    {
      patientEmail: 'lisa.anderson@example.com',
      date: new Date('2024-12-17'),
      diagnosis: 'Severe toothache - emergency extraction',
      treatment: 'Tooth extraction performed under local anesthesia. Antibiotics prescribed.',
      notes: 'Emergency visit. Patient in significant pain. Extraction successful.',
      attachments: [],
    },
    {
      patientEmail: 'james.taylor@example.com',
      date: new Date('2024-08-20'),
      diagnosis: 'Crown preparation',
      treatment: 'Tooth prepared for crown. Temporary crown placed.',
      notes: 'Patient is diabetic. Healing monitored closely. No complications.',
      attachments: [],
    },
    {
      patientEmail: 'maria.garcia@example.com',
      date: new Date('2024-12-10'),
      diagnosis: 'Prenatal dental consultation',
      treatment: 'Comprehensive examination. X-rays avoided due to pregnancy.',
      notes: 'Patient is 6 months pregnant. Advised on safe dental practices during pregnancy.',
      attachments: [],
    },
  ];

  for (const recordData of medicalRecords) {
    const patient = await patientRepository.findOne({
      where: { email: recordData.patientEmail },
    });

    if (!patient) {
      console.log(`⚠ Patient not found: ${recordData.patientEmail}`);
      continue;
    }

    // Check if record already exists
    const existingRecord = await medicalRecordRepository.findOne({
      where: {
        patientId: patient.id,
        date: recordData.date,
        diagnosis: recordData.diagnosis,
      },
    });

    if (!existingRecord) {
      const medicalRecord = medicalRecordRepository.create({
        ...recordData,
        patientId: patient.id,
        doctorId: defaultDoctor.id, // Assign to default doctor
      });
      await medicalRecordRepository.save(medicalRecord);
      console.log(`✓ Seeded medical record for ${patient.name} dated ${recordData.date.toISOString().split('T')[0]}`);
    } else {
      console.log(`⊘ Medical record already exists for ${patient.name}`);
    }
  }
}

