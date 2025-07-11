import User from '../../models/User.js';
import Appointment from '../../models/Appointment.js';
import Alert from '../../models/Alert.js';

export async function seedAnalyticsData() {
  try {
    // Get existing users or create simple ones
    let users = await User.findAll();
    
    if (users.length === 0) {
      // Create simple users without password hashing for testing
      users = await User.bulkCreate([
        {
          email: 'admin@chronicare.com',
          password: 'hashedpassword',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
          email: 'doctor@chronicare.com',
          password: 'hashedpassword',
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          role: 'doctor',
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
        {
          email: 'patient1@chronicare.com',
          password: 'hashedpassword',
          firstName: 'John',
          lastName: 'Smith',
          role: 'patient',
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          email: 'patient2@chronicare.com',
          password: 'hashedpassword',
          firstName: 'Emily',
          lastName: 'Davis',
          role: 'patient',
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        },
      ]);
    }

    console.log('✅ Users ready');

    // Create sample appointments for the last 7 days
    const appointments = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create 1-5 appointments per day
      const numAppointments = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < numAppointments; j++) {
        appointments.push({
          title: `Appointment ${j + 1}`,
          description: `Sample appointment ${j + 1} for day ${i + 1}`,
          doctorId: users.find(u => u.role === 'doctor')?.id || users[0].id,
          patientId: users.find(u => u.role === 'patient')?.id || users[2].id,
          scheduledAt: new Date(date.getTime() + j * 60 * 60 * 1000), // Spread throughout the day
          status: 'scheduled',
          createdAt: date,
        });
      }
    }

    await Appointment.bulkCreate(appointments, { ignoreDuplicates: true });
    console.log('✅ Appointments created');

    // Create sample alerts for the last 7 days
    const alerts = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create 0-3 alerts per day
      const numAlerts = Math.floor(Math.random() * 4);
      for (let j = 0; j < numAlerts; j++) {
        const alertTypes = ['high', 'medium', 'low', 'critical'];
        const alertTitles = [
          'High Blood Pressure Alert',
          'Medication Reminder',
          'Appointment Confirmation',
          'System Maintenance',
          'Health Metric Update'
        ];
        
        alerts.push({
          title: alertTitles[Math.floor(Math.random() * alertTitles.length)],
          message: `Sample alert ${j + 1} for day ${i + 1}`,
          userId: users.find(u => u.role === 'patient')?.id || users[2].id,
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          isRead: Math.random() > 0.5,
          createdAt: date,
        });
      }
    }

    await Alert.bulkCreate(alerts, { ignoreDuplicates: true });
    console.log('✅ Alerts created');

    console.log('✅ Analytics data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding analytics data:', error);
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAnalyticsData();
} 