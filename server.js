import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';
import connectDB from './server/config/db.js';
import { notFound, errorHandler } from './server/middleware/errorHandler.js';

import authRoutes from './server/routes/authRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import categoryRoutes from './server/routes/categoryRoutes.js';
import cartRoutes from './server/routes/cartRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('/*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
  );
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default serverless(app);
