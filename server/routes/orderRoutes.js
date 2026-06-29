import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.get('/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
