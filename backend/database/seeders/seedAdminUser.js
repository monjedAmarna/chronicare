import User from '../../models/User.js';
import bcrypt from 'bcrypt';

export async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      where: { 
        email: 'fawaz.swafta@gmail.com' 
      } 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, skipping creation');
      return;
    }

    // Hash the password using bcrypt with 10 salt rounds
    const hashedPassword = await bcrypt.hash('FAWAZSAWAFTA12', 10);

    // Create the admin user with minimum required fields
    const adminUser = {
      name: 'Fawaz Sawafta',
      email: 'fawaz.swafta@gmail.com',
      password: hashedPassword,
      role: 'admin'
    };

    console.log('🔄 Attempting to create admin user...');
    const createdUser = await User.create(adminUser);
    
    // Verify the user was actually created
    if (createdUser && createdUser.id) {
      console.log('✅ Admin user seeded successfully');
      console.log('   ID:', createdUser.id);
      console.log('   Email: fawaz.swafta@gmail.com');
      console.log('   Role: admin');
      console.log('   Name: Fawaz Sawafta');
    } else {
      throw new Error('User creation returned null or invalid result');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
}

// Run seeder if called directly (for manual execution)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdminUser()
    .then(() => {
      console.log('✅ Admin user seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin user seeding failed:', error);
      process.exit(1);
    });
} 