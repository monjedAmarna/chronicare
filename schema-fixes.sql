-- Schema Fixes for ChronicareHealth Database
-- These ALTER TABLE statements will make the database compatible with the dummy data

-- 1. Fix Users table
ALTER TABLE users ADD COLUMN isActive BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Fix Appointments table
ALTER TABLE appointments ADD COLUMN status VARCHAR(50) DEFAULT 'upcoming';
ALTER TABLE appointments ADD COLUMN notes TEXT;
ALTER TABLE appointments ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE appointments ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 3. Fix Health Metrics table
ALTER TABLE health_metrics ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE health_metrics ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 4. Fix Medications table
ALTER TABLE medications ADD COLUMN doctorId INT;
ALTER TABLE medications ADD COLUMN status VARCHAR(50) DEFAULT 'active';
ALTER TABLE medications ADD COLUMN notes TEXT;
ALTER TABLE medications ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE medications ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 5. Fix Reports table
ALTER TABLE reports ADD COLUMN title VARCHAR(255);
ALTER TABLE reports ADD COLUMN type VARCHAR(100);
ALTER TABLE reports ADD COLUMN generatedAt TIMESTAMP;
ALTER TABLE reports ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 6. Fix Care Plans table
ALTER TABLE care_plans ADD COLUMN startDate DATE;
ALTER TABLE care_plans ADD COLUMN endDate DATE;
ALTER TABLE care_plans ADD COLUMN status VARCHAR(50) DEFAULT 'active';
ALTER TABLE care_plans ADD COLUMN goals TEXT;

-- 7. Fix Alerts table
ALTER TABLE alerts ADD COLUMN severity VARCHAR(50) DEFAULT 'medium';
ALTER TABLE alerts ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 8. Create Medication Logs table (missing entirely)
CREATE TABLE medication_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicationId INT NOT NULL,
    patientId INT NOT NULL,
    takenAt TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (medicationId) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (patientId) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_appointments_doctor ON appointments(doctorId);
CREATE INDEX idx_appointments_patient ON appointments(patientId);
CREATE INDEX idx_health_metrics_user ON health_metrics(userId);
CREATE INDEX idx_medications_user ON medications(userId);
CREATE INDEX idx_medications_doctor ON medications(doctorId);
CREATE INDEX idx_reports_user ON reports(userId);
CREATE INDEX idx_care_plans_patient ON care_plans(patientId);
CREATE INDEX idx_care_plans_created_by ON care_plans(createdBy);
CREATE INDEX idx_alerts_user ON alerts(userId);
CREATE INDEX idx_medication_logs_medication ON medication_logs(medicationId);
CREATE INDEX idx_medication_logs_patient ON medication_logs(patientId); 