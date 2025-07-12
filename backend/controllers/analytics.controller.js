import { getTimeBasedAnalytics } from '../services/analytics.service.js';
import { getRecentTrends } from '../services/analytics.service.js';
import { getPatientHealthSummary } from '../services/analytics.service.js';

export async function getAnalytics(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await getTimeBasedAnalytics(startDate, endDate);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function recentTrends(req, res) {
  try {
    const trends = await getRecentTrends();
    res.json(trends);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recent trends', error: err.message });
  }
}

export async function getPatientHealthSummaryController(req, res) {
  try {
    console.log("🔍 Analytics Controller: getPatientHealthSummaryController called");
    console.log("🔍 User from request:", req.user);
    console.log("🔍 User ID:", req.user.id);
    console.log("🔍 User role:", req.user.role);
    
    const userId = req.user.id;
    const summary = await getPatientHealthSummary(userId);
    
    console.log("🔍 Analytics Controller: Sending response:", JSON.stringify(summary, null, 2));
    res.json(summary);
  } catch (err) {
    console.error("❌ Analytics Controller Error:", err);
    res.status(500).json({ message: 'Failed to fetch health summary', error: err.message });
  }
} 