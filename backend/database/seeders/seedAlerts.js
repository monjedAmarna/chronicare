import Alert from '../../models/Alert.js';
import User from '../../models/User.js';

export async function seedAlerts() {
  try {
    // Get some existing users to associate with alerts
    const users = await User.findAll({ limit: 5 });
    
    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      return;
    }

    const sampleAlerts = [
      {
        title: 'High Blood Pressure Alert',
        message: 'Patient blood pressure readings are consistently elevated',
        userId: users[0].id,
        type: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        title: 'Critical Glucose Level',
        message: 'Patient glucose level is critically high and requires immediate attention',
        userId: users[1].id,
        type: 'critical',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        title: 'Medication Adherence Warning',
        message: 'Patient has missed multiple medication doses this week',
        userId: users[2].id,
        type: 'medium',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        title: 'System Maintenance Required',
        message: 'Database backup is overdue and should be performed soon',
        userId: users[0].id,
        type: 'low',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      },
      {
        title: 'Appointment Reminder',
        message: 'Patient has an upcoming appointment that needs confirmation',
        userId: users[3].id,
        type: 'medium',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
    ];

    // Clear existing alerts
    await Alert.destroy({ where: {} });

    // Create new alerts
    await Alert.bulkCreate(sampleAlerts);

    console.log('✅ Alerts seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding alerts:', error);
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAlerts();
} 