import AuditLog from '../../models/AuditLog.js';
import ErrorLog from '../../models/ErrorLog.js';
import ActivityLog from '../../models/ActivityLog.js';
import sequelize from '../../config/db.js';

const sampleAuditLogs = [
  {
    action: 'User created',
    userId: 1,
    userEmail: 'admin@chronicare.com',
    userRole: 'admin',
    details: 'Created new user: john.doe@example.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success'
  },
  {
    action: 'Database backup',
    userId: 1,
    userEmail: 'admin@chronicare.com',
    userRole: 'admin',
    details: 'Scheduled backup completed successfully',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success'
  },
  {
    action: 'Cache refreshed',
    userId: 1,
    userEmail: 'admin@chronicare.com',
    userRole: 'admin',
    details: 'System cache cleared and refreshed',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success'
  },
  {
    action: 'Security scan',
    userId: 1,
    userEmail: 'admin@chronicare.com',
    userRole: 'admin',
    details: 'Security scan completed - no issues found',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success'
  },
  {
    action: 'Settings updated',
    userId: 1,
    userEmail: 'admin@chronicare.com',
    userRole: 'admin',
    details: 'Updated system settings: notification_email, max_alerts_displayed',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success'
  }
];

const sampleErrorLogs = [
  {
    level: 'error',
    message: 'Database connection timeout',
    stack: 'Error: Connection timeout\n    at ConnectionManager.connect',
    userId: 2,
    userEmail: 'doctor@chronicare.com',
    endpoint: '/api/patients',
    method: 'GET',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    responseStatus: 500
  },
  {
    level: 'warning',
    message: 'Invalid login attempt',
    userId: null,
    userEmail: 'unknown@example.com',
    endpoint: '/api/auth/login',
    method: 'POST',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    responseStatus: 401
  },
  {
    level: 'error',
    message: 'File upload failed',
    stack: 'Error: File size exceeds limit\n    at uploadMiddleware',
    userId: 3,
    userEmail: 'patient@chronicare.com',
    endpoint: '/api/reports/upload',
    method: 'POST',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    responseStatus: 413
  }
];

const sampleActivityLogs = [
  {
    userId: 1,
    userEmail: 'admin@chronicare.com',
    userRole: 'admin',
    activity: 'Login',
    category: 'auth',
    details: 'Successful login from admin panel',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    endpoint: '/api/auth/login',
    method: 'POST',
    status: 'success',
    duration: 150
  },
  {
    userId: 2,
    userEmail: 'doctor@chronicare.com',
    userRole: 'doctor',
    activity: 'View Dashboard',
    category: 'dashboard',
    details: 'Accessed doctor dashboard',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    endpoint: '/api/doctor/dashboard',
    method: 'GET',
    status: 'success',
    duration: 200
  },
  {
    userId: 3,
    userEmail: 'patient@chronicare.com',
    userRole: 'patient',
    activity: 'Create Appointment',
    category: 'appointments',
    details: 'Scheduled appointment with Dr. Smith',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    endpoint: '/api/appointments',
    method: 'POST',
    status: 'success',
    duration: 300
  },
  {
    userId: 1,
    userEmail: 'admin@chronicare.com',
    userRole: 'admin',
    activity: 'View Reports',
    category: 'reports',
    details: 'Generated monthly system report',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    endpoint: '/api/reports/monthly',
    method: 'GET',
    status: 'success',
    duration: 500
  },
  {
    userId: 2,
    userEmail: 'doctor@chronicare.com',
    userRole: 'doctor',
    activity: 'Update Patient Record',
    category: 'patients',
    details: 'Updated patient medical history',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    endpoint: '/api/patients/123/update',
    method: 'PUT',
    status: 'success',
    duration: 250
  }
];

async function seedLogs() {
  try {
    console.log('🌱 Seeding system logs...');
    
    // Clear existing logs
    await Promise.all([
      AuditLog.destroy({ where: {}, truncate: true }),
      ErrorLog.destroy({ where: {}, truncate: true }),
      ActivityLog.destroy({ where: {}, truncate: true })
    ]);
    
    // Insert sample audit logs
    await AuditLog.bulkCreate(sampleAuditLogs);
    console.log(`✅ Created ${sampleAuditLogs.length} audit logs`);
    
    // Insert sample error logs
    await ErrorLog.bulkCreate(sampleErrorLogs);
    console.log(`✅ Created ${sampleErrorLogs.length} error logs`);
    
    // Insert sample activity logs
    await ActivityLog.bulkCreate(sampleActivityLogs);
    console.log(`✅ Created ${sampleActivityLogs.length} activity logs`);
    
    console.log('🎉 System logs seeding completed!');
    console.log(`📊 Total logs created: ${sampleAuditLogs.length + sampleErrorLogs.length + sampleActivityLogs.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding system logs:', error);
    throw error;
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sequelize.sync({ alter: true })
    .then(() => seedLogs())
    .then(() => {
      console.log('🎉 System logs seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedLogs; 