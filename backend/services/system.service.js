import AuditLog from '../models/AuditLog.js';
import ErrorLog from '../models/ErrorLog.js';
import ActivityLog from '../models/ActivityLog.js';
import logger from '../utils/logger.js';

class SystemService {
  /**
   * Clear all system logs from the database
   * @param {Object} adminUser - The admin user performing the action
   * @returns {Promise<Object>} Result of the operation
   */
  async clearSystemLogs(adminUser) {
    try {
      logger.info('Starting system logs clearing process', {
        adminId: adminUser.id,
        adminEmail: adminUser.email
      });

      // Get counts before clearing for audit purposes
      const auditLogCount = await AuditLog.count();
      const errorLogCount = await ErrorLog.count();
      const activityLogCount = await ActivityLog.count();

      // Clear all log tables
      await Promise.all([
        AuditLog.destroy({ where: {}, truncate: true }),
        ErrorLog.destroy({ where: {}, truncate: true }),
        ActivityLog.destroy({ where: {}, truncate: true })
      ]);

      // Log this action in audit log (this will be the first entry after clearing)
      await AuditLog.create({
        action: 'System logs cleared',
        userId: adminUser.id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        details: `Cleared ${auditLogCount} audit logs, ${errorLogCount} error logs, and ${activityLogCount} activity logs`,
        ipAddress: adminUser.ipAddress || null,
        userAgent: adminUser.userAgent || null,
        status: 'success'
      });

      logger.info('System logs cleared successfully', {
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        clearedCounts: {
          auditLogs: auditLogCount,
          errorLogs: errorLogCount,
          activityLogs: activityLogCount
        }
      });

      return {
        success: true,
        message: 'System logs cleared successfully',
        clearedCounts: {
          auditLogs: auditLogCount,
          errorLogs: errorLogCount,
          activityLogs: activityLogCount
        }
      };
    } catch (error) {
      logger.error('Failed to clear system logs', {
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        error: error.message
      });

      throw new Error('Failed to clear system logs');
    }
  }

  /**
   * Get system logs statistics
   * @returns {Promise<Object>} Log statistics
   */
  async getLogStatistics() {
    try {
      const [auditLogCount, errorLogCount, activityLogCount] = await Promise.all([
        AuditLog.count(),
        ErrorLog.count(),
        ActivityLog.count()
      ]);

      return {
        auditLogs: auditLogCount,
        errorLogs: errorLogCount,
        activityLogs: activityLogCount,
        total: auditLogCount + errorLogCount + activityLogCount
      };
    } catch (error) {
      logger.error('Failed to get log statistics', { error: error.message });
      throw new Error('Failed to get log statistics');
    }
  }

  /**
   * Get recent audit logs
   * @param {number} limit - Number of logs to return
   * @returns {Promise<Array>} Recent audit logs
   */
  async getRecentAuditLogs(limit = 50) {
    try {
      return await AuditLog.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit,
        attributes: ['id', 'action', 'userEmail', 'userRole', 'details', 'status', 'createdAt']
      });
    } catch (error) {
      logger.error('Failed to get recent audit logs', { error: error.message });
      throw new Error('Failed to get recent audit logs');
    }
  }
}

export default new SystemService(); 