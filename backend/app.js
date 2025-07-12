import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './config/db.js';
import './models/index.js'; // Ensure all models and associations are loaded
import authRoutes from './routes/auth.routes.js';
import metricRoutes from './routes/metric.routes.js';
import reportRoutes from './routes/report.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import medicationRoutes from './routes/medication.routes.js';
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import alertRoutes from './routes/alert.routes.js';
import carePlanRoutes from './routes/careplan.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import activitiesRoutes from './routes/activities.routes.js';
import systemRoutes from './routes/system.routes.js';
import systemSettingsRoutes from './routes/systemSettings.routes.js';
import { seedAdminUser } from './database/seeders/seedAdminUser.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Make io globally available
global.io = io;

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Handle user authentication for socket
  socket.on('authenticate', (token) => {
    // Store user info in socket for targeted notifications
    socket.userToken = token;
    console.log('Socket authenticated for user');
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chronicare backend is running.' });
});

// Mount routes from /routes
app.use('/api/auth', authRoutes);
app.use('/api/health-metrics', metricRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/care-plans', carePlanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/system/settings', systemSettingsRoutes);

// Debug: print all registered routes
app._router.stack
  .filter(r => r.route)
  .forEach(r => console.log(r.route.path));

server.listen(PORT, () => {
  console.log(`Chronicare backend listening on port ${PORT}`);
});

// Sync Sequelize models to the database and seed admin user
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synced successfully.');
    
    // Seed admin user after database sync
    try {
      console.log('🌱 Checking for admin user...');
      await seedAdminUser();
      console.log('✅ Admin user seeding completed during startup.');
    } catch (error) {
      console.error('⚠️  Admin user seeding failed during startup:', error.message);
      // Don't crash the app if seeding fails
    }
  })
  .catch((err) => {
    console.error('Database sync error:', err);
  }); 