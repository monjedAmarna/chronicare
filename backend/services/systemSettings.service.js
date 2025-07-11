import SystemSettings from '../models/SystemSettings.js';
import logger from '../utils/logger.js';

class SystemSettingsService {
  /**
   * Get all system settings
   * @returns {Promise<Object>} Object with key-value pairs of settings
   */
  async getAllSettings() {
    try {
      const settings = await SystemSettings.findAll();
      const settingsObject = {};
      
      settings.forEach(setting => {
        settingsObject[setting.key] = setting.value;
      });
      
      return settingsObject;
    } catch (error) {
      logger.error('Error fetching system settings:', error);
      throw new Error('Failed to fetch system settings');
    }
  }

  /**
   * Update multiple system settings
   * @param {Object} settings - Object with key-value pairs to update
   * @returns {Promise<Object>} Updated settings object
   */
  async updateSettings(settings) {
    try {
      const updates = [];
      
      for (const [key, value] of Object.entries(settings)) {
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
          throw new Error(`Invalid value type for setting '${key}'. Must be string, number, or boolean.`);
        }
        
        const stringValue = String(value);
        
        updates.push(
          SystemSettings.upsert({
            key,
            value: stringValue,
            updatedAt: new Date()
          })
        );
      }
      
      await Promise.all(updates);
      
      // Return the updated settings
      return await this.getAllSettings();
    } catch (error) {
      logger.error('Error updating system settings:', error);
      throw new Error('Failed to update system settings');
    }
  }

  /**
   * Get a specific setting by key
   * @param {string} key - Setting key
   * @returns {Promise<string|null>} Setting value or null if not found
   */
  async getSetting(key) {
    try {
      const setting = await SystemSettings.findOne({ where: { key } });
      return setting ? setting.value : null;
    } catch (error) {
      logger.error(`Error fetching setting '${key}':`, error);
      throw new Error(`Failed to fetch setting '${key}'`);
    }
  }

  /**
   * Initialize default settings if they don't exist
   * @returns {Promise<void>}
   */
  async initializeDefaultSettings() {
    try {
      const defaultSettings = {
        system_name: 'Chronicare Health',
        default_language: 'en',
        notification_email: 'alerts@chronicare.com',
        max_alerts_displayed: '10',
        maintenance_mode: 'false',
        session_timeout_minutes: '30',
        max_login_attempts: '5',
        password_min_length: '8'
      };

      await this.updateSettings(defaultSettings);
      logger.info('Default system settings initialized');
    } catch (error) {
      logger.error('Error initializing default settings:', error);
      throw new Error('Failed to initialize default settings');
    }
  }
}

export default new SystemSettingsService(); 