import CarePlan from '../models/CarePlan.js';
import User from '../models/User.js';

export async function createCarePlan(carePlanData, currentUserId) {
  // Verify that the target patient exists and has role 'patient'
  const patient = await User.findOne({
    where: { id: carePlanData.patientId, role: 'patient' }
  });
  
  if (!patient) {
    throw new Error('Target patient not found');
  }

  return await CarePlan.create({
    ...carePlanData,
    createdBy: currentUserId,
  });
}

export async function getAllCarePlans(user) {
  let where = {};
  
  // Filter by role: doctors only see their own care plans
  if (user.role === 'doctor') {
    where.createdBy = user.id;
  }
  // Admins see all care plans (no additional filtering)
  
  const carePlans = await CarePlan.findAll({
    where,
    include: [
      {
        model: User,
        as: 'patient',
        attributes: ['id', 'name', 'firstName', 'lastName', 'email'],
        foreignKey: 'patientId',
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'firstName', 'lastName', 'email'],
        foreignKey: 'createdBy',
      }
    ],
    order: [['createdAt', 'DESC']],
  });

  // Compute dynamic progress for each care plan
  return carePlans.map(plan => {
    const planData = plan.toJSON();
    
    // Calculate progress dynamically
    if (planData.totalTasks > 0) {
      planData.progress = Math.round((planData.completedTasks / planData.totalTasks) * 100);
    } else {
      planData.progress = 0;
    }
    
    return planData;
  });
}

export async function getCarePlanById(id) {
  return await CarePlan.findByPk(id, {
    include: [
      {
        model: User,
        as: 'patient',
        attributes: ['id', 'name', 'firstName', 'lastName', 'email'],
        foreignKey: 'patientId',
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'firstName', 'lastName', 'email'],
        foreignKey: 'createdBy',
      }
    ],
  });
}

export async function updateCarePlan(id, updateData, currentUserId, currentUserRole) {
  const carePlan = await CarePlan.findByPk(id);
  if (!carePlan) {
    throw new Error('Care plan not found');
  }

  // Check permissions: only creator or admin can update
  if (currentUserRole !== 'admin' && carePlan.createdBy !== currentUserId) {
    throw new Error('Access denied');
  }

  await carePlan.update(updateData);
  return carePlan;
}

export async function deleteCarePlan(id, currentUserId, currentUserRole) {
  const carePlan = await CarePlan.findByPk(id);
  if (!carePlan) {
    throw new Error('Care plan not found');
  }

  // Check permissions: only creator or admin can delete
  if (currentUserRole !== 'admin' && carePlan.createdBy !== currentUserId) {
    throw new Error('Access denied');
  }

  await carePlan.destroy();
  return { message: 'Care plan deleted successfully' };
} 