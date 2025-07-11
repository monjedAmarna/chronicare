import SystemSettings from '../../models/SystemSettings.js';
import sequelize from '../../config/db.js';

const defaultSettings = [
  {
    key: 'system_name',
    value: 'Chronicare Health',
    updatedAt: new Date()
  },
  {
    key: 'default_language',
    value: 'en',
    updatedAt: new Date()
  },
  {
    key: 'notification_email',
    value: 'alerts@chronicare.com',
    updatedAt: new Date()
  },
  {
    key: 'max_alerts_displayed',
    value: '10',
    updatedAt: new Date()
  },
  {
    key: 'maintenance_mode',
    value: 'false',
    updatedAt: new Date()
  },
  {
    key: 'session_timeout_minutes',
    value: '30',
    updatedAt: new Date()
  },
  {
    key: 'max_login_attempts',
    value: '5',
    updatedAt: new Date()
  },
  {
    key: 'password_min_length',
    value: '8',
    updatedAt: new Date()
  }
];

async function seedSystemSettings() {
  try {
    console.log('🌱 Seeding system settings...');
    
    // Clear existing settings
    await SystemSettings.destroy({ where: {} });
    
    // Insert default settings
    await SystemSettings.bulkCreate(defaultSettings);
    
    console.log('✅ System settings seeded successfully!');
    console.log(`📊 Created ${defaultSettings.length} system settings`);
    
  } catch (error) {
    console.error('❌ Error seeding system settings:', error);
    throw error;
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sequelize.sync({ alter: true })
    .then(() => seedSystemSettings())
    .then(() => {
      console.log('🎉 System settings seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedSystemSettings; 