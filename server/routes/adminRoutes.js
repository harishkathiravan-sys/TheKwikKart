import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  getAdminProducts,
  getAdminStats,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUserById);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.put('/users/:id/toggle-block', protect, adminOnly, toggleBlockUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.get('/products', protect, adminOnly, getAdminProducts);

export default router;
