# Debug Instructions for Correction Dose Card

## Steps to Debug:

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

3. **Open browser console** and navigate to the Patient Dashboard

4. **Add a new glucose reading** in the Health Metrics page

5. **Check the console logs** for the following debug information:

### Backend Logs (Terminal):
- `🔍 Backend: getPatientHealthSummary called for userId: X`
- `🔍 Backend: glucoseMetrics query result: [...]`
- `🔍 Backend: latestGlucoseMetric found: {...}`
- `🔍 Backend: All glucose metrics for user: [...]`
- `🔍 Backend: Returning result: {...}`

### Frontend Logs (Browser Console):
- `🔍 Frontend API: Calling getPatientHealthSummary`
- `🔍 Frontend API: Received response: {...}`
- `🏥 PatientDashboard Debug:`
- `🔍 HealthSummaryStats Debug:`
- `🔍 Processing glucose data...`
- `🧮 Calculating correction dose with glucose: X`

## Expected Issues to Look For:

1. **No backend logs** = Route not being hit
2. **No glucose metrics in database** = No data to display
3. **Frontend not receiving metrics array** = Backend not returning correct data
4. **latestGlucose is null** = Data not being processed correctly

## Quick Test:

Visit: `http://localhost:4000/api/analytics/test`
Should return: `{"message":"Analytics route is working"}`

## Common Issues:

1. **Role restriction** - Check if user has 'patient' role
2. **Database empty** - No glucose metrics exist
3. **Cache not invalidated** - Old data being shown
4. **API endpoint wrong** - Wrong URL being called 