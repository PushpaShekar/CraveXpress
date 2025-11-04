import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  getMyProducts,
  getCategories,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../../../types';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/seller/:sellerId', getProductsBySeller);
router.get('/:id', getProductById);

// Protected routes
router.post('/', protect, authorize(UserRole.SELLER, UserRole.ADMIN), createProduct);
router.put('/:id', protect, authorize(UserRole.SELLER, UserRole.ADMIN), updateProduct);
router.delete('/:id', protect, authorize(UserRole.SELLER, UserRole.ADMIN), deleteProduct);
router.get('/my/products', protect, authorize(UserRole.SELLER), getMyProducts);

export default router;

