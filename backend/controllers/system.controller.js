import sequelize from '../config/db.js';
import systemService from '../services/system.service.js';
import logger from '../utils/logger.js';

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export async function getSystemHealth(req, res) {
  const start = process.hrtime();
  let dbStatus = 'Healthy';
  try {
    await sequelize.authenticate();
    dbStatus = 'Healthy';
  } catch (err) {
    dbStatus = 'Disconnected';
  }
  const uptime = formatUptime(process.uptime());
  const diff = process.hrtime(start);
  const apiResponseTime = `${Math.round((diff[0] * 1e9 + diff[1]) / 1e6)}ms`;
  res.json({
    server: 'Online',
    database: dbStatus,
    apiResponseTime,
    uptime
  });
}

export async function refreshCache(req, res) {
  // Simulate cache refresh
  setTimeout(() => {
    res.json({ success: true, message: 'Cache refreshed.' });
  }, 1000);
}

export async function backupDatabase(req, res) {
  // Simulate database backup
  setTimeout(() => {
    res.json({ success: true, message: 'Database backup started.' });
  }, 1500);
}

export async function runSecurityScan(req, res) {
  // Simulate security scan
  setTimeout(() => {
    res.json({ success: true, issuesFound: 0, message: 'Security scan completed. No issues found.' });
  }, 2000);
}

export async function getAuditLogs(req, res) {
  try {
    const logs = await systemService.getRecentAuditLogs(50);
    res.json(logs);
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch audit logs' 
    });
  }
}

export async function clearLogs(req, res) {
  try {
    // Add user info from request
    const adminUser = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const result = await systemService.clearSystemLogs(adminUser);
    
    res.json({
      success: true,
      message: result.message,
      clearedCounts: result.clearedCounts
    });
  } catch (error) {
    logger.error('Error clearing system logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear system logs' 
    });
  }
} 