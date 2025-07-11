import systemSettingsService from '../services/systemSettings.service.js';
import logger from '../utils/logger.js';

class SystemSettingsController {
  /**
   * Get all system settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllSettings(req, res) {
    try {
      const settings = await systemSettingsService.getAllSettings();
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Error in getAllSettings controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch system settings'
      });
    }
  }

  /**
   * Update multiple system settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSettings(req, res) {
    try {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Settings object is required'
        });
      }

      // Validate settings object
      const validKeys = [
        'system_name',
        'default_language', 
        'notification_email',
        'max_alerts_displayed',
        'maintenance_mode',
        'session_timeout_minutes',
        'max_login_attempts',
        'password_min_length'
      ];

      const invalidKeys = Object.keys(settings).filter(key => !validKeys.includes(key));
      if (invalidKeys.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid setting keys: ${invalidKeys.join(', ')}`
        });
      }

      const updatedSettings = await systemSettingsService.updateSettings(settings);
      
      logger.info('System settings updated by admin', {
        adminId: req.user.id,
        updatedSettings: Object.keys(settings)
      });

      res.json({
        success: true,
        message: 'System settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      logger.error('Error in updateSettings controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update system settings'
      });
    }
  }

  /**
   * Initialize default settings (for first-time setup)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initializeSettings(req, res) {
    try {
      await systemSettingsService.initializeDefaultSettings();
      
      const settings = await systemSettingsService.getAllSettings();
      
      res.json({
        success: true,
        message: 'Default system settings initialized successfully',
        data: settings
      });
    } catch (error) {
      logger.error('Error in initializeSettings controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize system settings'
      });
    }
  }
}

export default new SystemSettingsController(); 