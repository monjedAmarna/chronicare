import Report from '../models/Report.js';
import { getStatsService } from '../services/report.service.js';

export async function createReport(req, res) {
  try {
    let { data, creationDate } = req.body;
    if (!data) return res.status(400).json({ message: 'Data is required' });
    if (typeof data !== 'string') data = JSON.stringify(data);
    const report = await Report.create({
      userId: req.user.id,
      data,
      createdAt: creationDate || new Date(),
    });
    res.status(201).json({
      id: report.id,
      data: report.data,
      creationDate: report.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getReports(req, res) {
  try {
    const reports = await Report.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(reports.map(r => ({
      id: r.id,
      data: r.data,
      creationDate: r.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function deleteReport(req, res) {
  try {
    const { id } = req.params;
    const report = await Report.findOne({ where: { id, userId: req.user.id } });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    await report.destroy();
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getStats(req, res) {
  try {
    const stats = await getStatsService();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
} 