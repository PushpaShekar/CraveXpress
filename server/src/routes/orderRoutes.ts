import express from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getSellerOrders,
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../../../types';

const router = express.Router();

// Protected routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/seller/orders', protect, authorize(UserRole.SELLER, UserRole.ADMIN), getSellerOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize(UserRole.ADMIN, UserRole.SELLER), updateOrderStatus);
router.put('/:id/payment', protect, updatePaymentStatus);
router.put('/:id/cancel', protect, cancelOrder);

// Admin routes
router.get('/', protect, authorize(UserRole.ADMIN), getAllOrders);

export default router;

