import User from '../../models/User.js';
import bcrypt from 'bcrypt';

export async function seedUsers() {
  try {
    // Clear existing users
    await User.destroy({ where: {} });

    const hashedPassword = await bcrypt.hash('password123', 10);

    const sampleUsers = [
      {
        email: 'admin@chronicare.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      },
      {
        email: 'doctor@chronicare.com',
        password: hashedPassword,
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        role: 'doctor',
        isActive: true,
        isEmailVerified: true,
      },
      {
        email: 'patient1@chronicare.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Smith',
        role: 'patient',
        isActive: true,
        isEmailVerified: true,
      },
      {
        email: 'patient2@chronicare.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Davis',
        role: 'patient',
        isActive: true,
        isEmailVerified: true,
      },
      {
        email: 'patient3@chronicare.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Lee',
        role: 'patient',
        isActive: true,
        isEmailVerified: true,
      },
    ];

    await User.bulkCreate(sampleUsers);
    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers();
} 