# Real-Time Health Alerts Implementation

## Overview

This document describes the implementation of real-time health alerts in the Chronicare system using Socket.IO. The system automatically detects abnormal health readings and sends instant notifications to relevant users.

## Features Implemented

### ✅ Backend Features
- **Socket.IO Integration**: Real-time communication between server and clients
- **Health Alert Thresholds**: Configurable thresholds for glucose and blood pressure
- **Automatic Alert Generation**: Alerts created when health metrics exceed thresholds
- **Real-time Notifications**: Instant Socket.IO events sent to connected clients
- **Database Integration**: Alerts stored in the existing Alert model

### ✅ Frontend Features
- **Socket.IO Client**: Real-time connection to the server
- **Toast Notifications**: Instant alert display using toast system
- **Connection Status**: Visual indicators for real-time connection status
- **Enhanced Health Forms**: Improved metric input with type selection and fasting options
- **Dashboard Integration**: Real-time alerts displayed in patient and doctor dashboards

## Health Alert Thresholds

### Blood Glucose
- **Fasting Glucose**:
  - Low Alert: < 70 mg/dL (Critical)
  - High Alert: > 126 mg/dL (High/Critical)
- **Random Glucose**:
  - High Alert: > 200 mg/dL (Critical)

### Blood Pressure
- **High Blood Pressure**:
  - Elevated: ≥ 140/90 mmHg (High)
  - Critical: ≥ 180/120 mmHg (Critical)
- **Low Blood Pressure**:
  - Low: < 90/60 mmHg (High)

## Technical Implementation

### Backend Changes

#### 1. Socket.IO Setup (`backend/app.js`)
```javascript
import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Make io globally available
global.io = io;
```

#### 2. Health Alert Utilities (`backend/utils/healthAlerts.js`)
- `checkGlucoseAlert()`: Validates glucose readings
- `checkBloodPressureAlert()`: Validates blood pressure readings
- `createHealthAlert()`: Creates alerts and emits Socket.IO events
- `processHealthMetrics()`: Main function to process health data

#### 3. Metric Controller Integration (`backend/controllers/metric.controller.js`)
```javascript
// Check for health alerts after metric creation
if (type === 'glucose' && value !== undefined) {
  alerts = await processHealthMetrics(req.user.id, { glucose: value, isFasting }, global.io);
} else if (type === 'blood_pressure' && value) {
  // Parse blood pressure and check alerts
}
```

### Frontend Changes

#### 1. Socket.IO Hook (`client/src/hooks/useSocket.ts`)
```typescript
export function useSocket(userId?: number) {
  // Manages Socket.IO connection
  // Listens for 'new-alert' events
  // Shows toast notifications for alerts
}
```

#### 2. Dashboard Integration
- **Patient Dashboard**: Shows real-time connection status and monitoring info
- **Doctor Dashboard**: Displays real-time alerts for assigned patients
- **Connection Indicators**: Visual feedback for Socket.IO connection status

#### 3. Enhanced Health Metrics Form
- Dropdown selection for metric types
- Automatic unit assignment
- Fasting checkbox for glucose readings
- Improved validation and user experience

## API Endpoints

### Health Metrics
- `POST /api/health-metrics` - Create health metric (now includes alert checking)

### Alerts
- `GET /api/alerts` - Get alerts (existing)
- `POST /api/alerts` - Create alert (existing)
- `PATCH /api/alerts/:id/read` - Mark alert as read (existing)

## Socket.IO Events

### Server to Client
- `new-alert`: Emitted when a new health alert is created
  ```javascript
  {
    id: number,
    userId: number,
    type: string,
    level: string,
    severity: string,
    value: string,
    message: string,
    timestamp: string
  }
  ```

### Client to Server
- `authenticate`: Client sends authentication token
- `disconnect`: Client disconnects

## Testing

### Alert Logic Tests
Run the alert logic tests (no database required):
```bash
cd backend
node test-alert-logic.js
```

### Full System Test
1. Start the backend server
2. Start the frontend client
3. Log in as a patient
4. Submit a health metric with abnormal values
5. Verify real-time alert appears

## Usage Examples

### Submitting a High Glucose Reading
1. Patient navigates to Health Metrics
2. Selects "Blood Glucose" type
3. Enters value: 250
4. Unchecks "Fasting glucose reading"
5. Submits the form
6. **Result**: Critical alert generated and real-time notification sent

### Submitting Critical Blood Pressure
1. Patient selects "Blood Pressure" type
2. Enters value: 190/125
3. Submits the form
4. **Result**: Critical alert generated and real-time notification sent

## Configuration

### Environment Variables
```env
FRONTEND_URL=http://localhost:5173  # Frontend URL for CORS
PORT=4000                          # Backend port
```

### Alert Thresholds
Thresholds can be modified in `backend/utils/healthAlerts.js`:
```javascript
export const HEALTH_THRESHOLDS = {
  glucose: {
    fasting: { low: 70, high: 126 },
    random: { high: 200 }
  },
  bloodPressure: {
    systolic: { low: 90, normal: 140, critical: 180 },
    diastolic: { low: 60, normal: 90, critical: 120 }
  }
};
```

## Security Considerations

1. **Authentication**: Socket.IO connections are authenticated using JWT tokens
2. **User Isolation**: Alerts are filtered by user ID to ensure privacy
3. **Input Validation**: All health metrics are validated before processing
4. **CORS Configuration**: Proper CORS setup for Socket.IO connections

## Performance Considerations

1. **Connection Management**: Socket.IO handles reconnection automatically
2. **Event Filtering**: Only relevant alerts are sent to specific users
3. **Database Optimization**: Alerts are created efficiently using existing models
4. **Memory Management**: Proper cleanup of Socket.IO connections

## Troubleshooting

### Common Issues

1. **Socket.IO Connection Failed**
   - Check if backend server is running
   - Verify CORS configuration
   - Check network connectivity

2. **Alerts Not Generated**
   - Verify health metric values are within alert thresholds
   - Check database connection
   - Review server logs for errors

3. **Real-time Notifications Not Appearing**
   - Check Socket.IO connection status
   - Verify user authentication
   - Check browser console for errors

### Debug Mode
Enable debug logging by setting environment variable:
```env
DEBUG=socket.io:*
```

## Future Enhancements

1. **Additional Health Metrics**: Heart rate, temperature, oxygen saturation alerts
2. **Custom Thresholds**: User-specific alert thresholds
3. **Alert Escalation**: Automatic escalation for critical alerts
4. **Push Notifications**: Browser push notifications for offline users
5. **Alert History**: Detailed alert history and analytics
6. **Mobile Support**: Native mobile app notifications

## Conclusion

The real-time health alert system is now fully implemented and integrated with the existing Chronicare platform. It provides instant notifications for concerning health readings while maintaining security and performance standards.

The system successfully:
- ✅ Detects abnormal health readings automatically
- ✅ Creates database records for alerts
- ✅ Sends real-time notifications via Socket.IO
- ✅ Displays alerts in user-friendly toast notifications
- ✅ Shows connection status and monitoring information
- ✅ Integrates seamlessly with existing dashboard functionality

The implementation follows best practices for real-time applications and provides a solid foundation for future enhancements. 