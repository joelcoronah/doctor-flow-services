import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

export async function seedUsers(dataSource: DataSource): Promise<User[]> {
  const userRepository = dataSource.getRepository(User);

  // Check if users already exist
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('⏭️  Users already exist, skipping seeder');
    const users = await userRepository.find();
    return users;
  }

  // Hash a common password for all test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@docflow.com',
      password: hashedPassword,
      phone: '+1-555-0101',
      specialization: 'General Dentistry',
      licenseNumber: 'DEN-2020-1234',
      provider: 'email' as const,
      role: 'admin' as const, // First user is admin
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Dr. Michael Chen',
      email: 'michael.chen@docflow.com',
      password: hashedPassword,
      phone: '+1-555-0102',
      specialization: 'Orthodontics',
      licenseNumber: 'ORTH-2019-5678',
      provider: 'email' as const,
      role: 'doctor' as const,
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@docflow.com',
      password: hashedPassword,
      phone: '+1-555-0103',
      specialization: 'Pediatric Dentistry',
      licenseNumber: 'PED-2021-9012',
      provider: 'email' as const,
      role: 'doctor' as const,
      isActive: true,
      isEmailVerified: true,
    },
    {
      name: 'Dr. James Wilson',
      email: 'james.wilson@docflow.com',
      password: hashedPassword,
      phone: '+1-555-0104',
      specialization: 'Oral Surgery',
      licenseNumber: 'SURG-2018-3456',
      provider: 'email' as const,
      role: 'doctor' as const,
      isActive: true,
      isEmailVerified: true,
    },
  ];

  const createdUsers = await userRepository.save(users);
  
  console.log(`✅ Created ${createdUsers.length} users`);
  console.log('\n📝 Test User Credentials:');
  console.log('   Admin: sarah.johnson@docflow.com / password123');
  console.log('   Doctor: michael.chen@docflow.com / password123');
  console.log('   Doctor: emily.rodriguez@docflow.com / password123');
  console.log('   Doctor: james.wilson@docflow.com / password123');
  
  return createdUsers;
}
