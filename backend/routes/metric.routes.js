import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { metricCreateValidation, metricUpdateValidation } from '../validators/metric.validator.js';
import { createMetric, getMetrics, updateMetric, deleteMetric, getMetricById, averageGlucose, healthMetricsSummary, recentHealthMetrics } from '../controllers/metric.controller.js';

const router = express.Router();

router.post('/', authMiddleware, metricCreateValidation, createMetric);
router.get('/', authMiddleware, getMetrics);
router.get('/average-glucose', authMiddleware, roleMiddleware(['admin']), averageGlucose);
router.get('/summary', authMiddleware, roleMiddleware(['admin']), healthMetricsSummary);
router.get('/recent', authMiddleware, roleMiddleware(['admin']), recentHealthMetrics);
router.get('/:id', authMiddleware, getMetricById);
router.put('/:id', authMiddleware, metricUpdateValidation, updateMetric);
router.delete('/:id', authMiddleware, deleteMetric);

export default router; 