import express from 'express';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, addReview);
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
