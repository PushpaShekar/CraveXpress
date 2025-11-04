import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllSellers,
  getUserStats,
} from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../../../types';

const router = express.Router();

// Public routes
router.get('/sellers', getAllSellers);

// Admin routes
router.get('/', protect, authorize(UserRole.ADMIN), getAllUsers);
router.get('/stats', protect, authorize(UserRole.ADMIN), getUserStats);
router.get('/:id', protect, authorize(UserRole.ADMIN), getUserById);
router.put('/:id', protect, authorize(UserRole.ADMIN), updateUser);
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteUser);

export default router;

