import * as carePlanService from '../services/careplan.service.js';

export async function getAllCarePlans(req, res) {
  try {
    const carePlans = await carePlanService.getAllCarePlans(req.user);
    
    // Format response to match frontend expectations
    const formattedCarePlans = carePlans.map(plan => {
      // Construct patientName from patient data
      const patientName = plan.patient?.name || 
        (plan.patient?.name || plan.patient?.email || 'Unknown User');
      
      return {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        status: plan.status,
        progress: plan.progress,
        duration: plan.duration,
        patientId: plan.patientId,
        patientName: patientName,
        assignedTo: plan.assignedTo,
        completedTasks: plan.completedTasks,
        totalTasks: plan.totalTasks,
        goals: plan.goals,
        createdAt: plan.createdAt,
      };
    });
    
    res.json(formattedCarePlans);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function createCarePlan(req, res) {
  try {
    const currentUserId = req.user.id;
    const carePlan = await carePlanService.createCarePlan(req.body, currentUserId);
    res.status(201).json(carePlan);
  } catch (err) {
    if (err.message === 'Target patient not found') {
      return res.status(404).json({ message: 'Target patient not found' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function getCarePlanById(req, res) {
  try {
    const { id } = req.params;
    const carePlan = await carePlanService.getCarePlanById(id);
    
    if (!carePlan) {
      return res.status(404).json({ message: 'Care plan not found' });
    }
    
    res.json(carePlan);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function updateCarePlan(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    const carePlan = await carePlanService.updateCarePlan(id, req.body, currentUserId, currentUserRole);
    res.json(carePlan);
  } catch (err) {
    if (err.message === 'Care plan not found') {
      return res.status(404).json({ message: 'Care plan not found' });
    }
    if (err.message === 'Access denied') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function deleteCarePlan(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    const result = await carePlanService.deleteCarePlan(id, currentUserId, currentUserRole);
    res.json(result);
  } catch (err) {
    if (err.message === 'Care plan not found') {
      return res.status(404).json({ message: 'Care plan not found' });
    }
    if (err.message === 'Access denied') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.status(500).json({ message: 'Something went wrong' });
  }
} 