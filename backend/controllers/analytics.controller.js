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
    const userId = req.user.id;
    const summary = await getPatientHealthSummary(userId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch health summary', error: err.message });
  }
} 