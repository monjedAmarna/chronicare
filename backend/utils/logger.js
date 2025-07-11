// Simple logger utility for the backend
class Logger {
  constructor() {
    this.timestamp = () => new Date().toISOString();
  }

  info(message, meta = {}) {
    console.log(`[${this.timestamp()}] INFO: ${message}`, meta);
  }

  error(message, meta = {}) {
    console.error(`[${this.timestamp()}] ERROR: ${message}`, meta);
  }

  warn(message, meta = {}) {
    console.warn(`[${this.timestamp()}] WARN: ${message}`, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.timestamp()}] DEBUG: ${message}`, meta);
    }
  }
}

// Create and export a default logger instance
const logger = new Logger();

export default logger; 