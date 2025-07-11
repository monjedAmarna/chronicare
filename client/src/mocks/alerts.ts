// Mock alerts data
export const mockAlerts = [
  {
    id: '1',
    type: 'glucose',
    value: 220,
    patient: 'John Smith',
    status: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'blood_pressure',
    value: '180/110',
    patient: 'Sarah Khan',
    status: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    type: 'heart_rate',
    value: 130,
    patient: 'Emily Davis',
    status: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '4',
    type: 'glucose',
    value: 60,
    patient: 'Michael Lee',
    status: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
]; 