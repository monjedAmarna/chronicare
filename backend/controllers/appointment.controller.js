import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

export async function createAppointment(req, res) {
  try {
    const { doctorId, patientId, date, time } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // Log incoming values for debugging
    console.log("\uD83D\uDCE5 Create appointment:", {
      doctorId,
      patientId,
      date,
      time,
      userId: req.user.id,
      role: req.user.role
    });

    // Security check: Only doctors can create appointments, and they can only create for themselves
    if (role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can create appointments' });
    }
    
    // Ensure the doctor is creating the appointment for themselves
    if (doctorId !== userId) {
      return res.status(403).json({ message: 'Doctors can only create appointments for themselves' });
    }

    // Verify the patient exists
    const patient = await User.findByPk(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      date,
      time,
    });
    res.status(201).json({
      id: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getAppointments(req, res) {
  try {
    // Admins can see all appointments, patients and doctors see their own
    const userId = req.user.id;
    const role = req.user.role;
    let where = {};
    if (role === 'patient') {
      where.patientId = userId;
    } else if (role === 'doctor') {
      where.doctorId = userId;
    } else if (role === 'admin') {
      // No filtering, admins see all appointments
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: User, as: 'Patient', attributes: ['id', 'name', 'firstName', 'lastName'] },
        { model: User, as: 'Doctor', attributes: ['id', 'name', 'firstName', 'lastName'] }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    res.json(appointments.map(appt => {
      // Calculate status based on current time vs appointment date/time
      const now = new Date();
      const appointmentDateTime = new Date(`${appt.date}T${appt.time}`);
      let status = 'Upcoming';
      if (appointmentDateTime < now) {
        status = 'Missed';
      }
      
      return {
        id: appt.id,
        doctorId: appt.doctorId,
        patientId: appt.patientId,
        date: appt.date,
        time: appt.time,
        patientName: appt.Patient ? (appt.Patient.name || appt.Patient.email || 'Unknown User') : undefined,
        doctorName: appt.Doctor ? (appt.Doctor.name || appt.Doctor.email || 'Unknown User') : undefined,
        status: status,
      };
    }));
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (role === 'patient' && appointment.patientId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (role === 'doctor' && appointment.doctorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await appointment.destroy();
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const { doctorId, date, time } = req.body;
    const userId = req.user.id;
    const role = req.user.role;
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Check ownership
    if (role === 'patient' && appointment.patientId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (role === 'doctor' && appointment.doctorId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update fields
    if (doctorId !== undefined) appointment.doctorId = doctorId;
    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;
    
    await appointment.save();
    
    res.json({
      id: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
} 