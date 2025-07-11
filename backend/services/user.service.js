import User from '../models/User.js';
import { hashPassword } from '../utils/hash.js';
import { Op } from 'sequelize';

export async function getAllUsers(searchTerm = null, role = null) {
  try {
    console.log('getAllUsers - Input params:', { searchTerm, role });
    
    const whereClause = {};
    
    // Add search filter if searchTerm is provided
    if (searchTerm && searchTerm.trim()) {
      // Use Op.like for MySQL compatibility (Op.iLike is PostgreSQL-specific)
      whereClause.name = { [Op.like]: `%${searchTerm.trim()}%` };
      console.log('getAllUsers - Search filter added:', whereClause.name);
    }
    
    // Add role filter if role is provided
    if (role && role.trim()) {
      whereClause.role = role.trim().toLowerCase();
      console.log('getAllUsers - Role filter added:', whereClause.role);
    }
    
    console.log('getAllUsers - Final where clause:', whereClause);
    
    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']],
    });
    
    console.log(`getAllUsers - Query successful, found ${users.length} users`);
    return users;
    
  } catch (error) {
    console.error('getAllUsers - Service error:', error);
    console.error('getAllUsers - Error stack:', error.stack);
    throw error; // Re-throw to be handled by controller
  }
}

export async function getUserById(id) {
  return await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });
}

export async function createUser(userData) {
  const hashedPassword = await hashPassword(userData.password);
  
  return await User.create({
    ...userData,
    password: hashedPassword,
  });
}

export async function updateUser(id, updateData) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }

  // Hash password if it's being updated
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  await user.update(updateData);
  return user;
}

export async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }

  await user.destroy();
  return { message: 'User deleted successfully' };
} 