import HealthMetric from '../models/HealthMetric.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import { Parser as Json2csvParser } from 'json2csv';
import { getHealthMetricsWithDateRange } from '../services/report.service.js';

export async function generateHealthDataReport(req, res) {
  try {
    const { startDate, endDate, searchTerm, metricType } = req.query;
    const user = req.user;
    const metrics = await getHealthMetricsWithDateRange({ user, startDate, endDate, searchTerm, metricType });
    // Return flat array for frontend
    const result = metrics.map(m => ({
      id: m.id,
      userId: m.userId,
      type: m.type,
      value: m.value,
      unit: m.unit,
      recordedAt: m.recordedAt,
      notes: m.notes
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate report', error: err.message });
  }
}

export async function exportHealthReport(req, res) {
  try {
    const userId = req.user.id;
    const format = req.params.format;
    const metrics = await HealthMetric.findAll({ 
      where: { userId }, 
      order: [['recordedAt', 'ASC']] 
    });
    
    if (format === 'csv') {
      const fields = ['type', 'value', 'unit', 'recordedAt', 'notes'];
      const parser = new Json2csvParser({ fields });
      const csv = parser.parse(metrics.map(m => ({
        type: m.type,
        value: m.value,
        unit: m.unit,
        recordedAt: m.recordedAt,
        notes: m.notes
      })));
      res.header('Content-Type', 'text/csv');
      res.attachment('health_report.csv');
      return res.send(csv);
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=health_report.pdf');
      doc.pipe(res);
      doc.fontSize(18).text('Health Report', { align: 'center' });
      doc.moveDown();
      metrics.forEach(m => {
        doc.fontSize(12).text(`Type: ${m.type}`);
        doc.text(`Value: ${m.value} ${m.unit || ''}`);
        doc.text(`Date: ${m.recordedAt}`);
        if (m.notes) doc.text(`Notes: ${m.notes}`);
        doc.moveDown();
      });
      doc.end();
    } else {
      res.status(400).json({ success: false, message: 'Invalid format' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to export report', error: err.message });
  }
} 