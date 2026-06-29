import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/KwikKartDB';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const categories = [
  { name: 'Electronics', slug: slugify('Electronics'), description: 'Latest gadgets and electronic devices', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=400' },
  { name: 'Fashion', slug: slugify('Fashion'), description: 'Trendy clothing and accessories', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
  { name: 'Home & Living', slug: slugify('Home & Living'), description: 'Everything for your home', image: 'https://images.unsplash.com/photo-1484101403633-562f6c69a3d0?w=400' },
  { name: 'Books', slug: slugify('Books'), description: 'Books across all genres', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
  { name: 'Sports & Fitness', slug: slugify('Sports & Fitness'), description: 'Sports gear and fitness equipment', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
  { name: 'Beauty & Health', slug: slugify('Beauty & Health'), description: 'Beauty products and health essentials', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
  { name: 'Toys & Games', slug: slugify('Toys & Games'), description: 'Fun for all ages', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400' },
  { name: 'Automotive', slug: slugify('Automotive'), description: 'Car accessories and tools', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
];

const products = [
  {
    name: 'Wireless Bluetooth Headphones Pro',
    description: 'Premium noise-cancelling wireless headphones with 40-hour battery life, Hi-Res audio, and ultra-comfortable over-ear design.',
    price: 2999,
    comparePrice: 4999,
    images: ['/product-headphones.jpg'],
    brand: 'SoundMax',
    stock: 50,
    featured: true,
    tags: ['headphones', 'wireless', 'bluetooth', 'audio'],
    specifications: [
      { key: 'Battery Life', value: '40 hours' },
      { key: 'Connectivity', value: 'Bluetooth 5.0' },
      { key: 'Weight', value: '250g' },
    ],
  },
  {
    name: 'Ultra HD 4K Smart TV 55"',
    description: 'Stunning 4K Ultra HD Smart TV with HDR10+, built-in streaming apps, voice control, and cinematic sound.',
    price: 42999,
    comparePrice: 59999,
    images: ['/product-laptop.jpg'],
    brand: 'VisionX',
    stock: 25,
    featured: true,
    tags: ['tv', '4k', 'smart tv', 'entertainment'],
    specifications: [
      { key: 'Resolution', value: '3840 x 2160' },
      { key: 'Screen Size', value: '55 inches' },
      { key: 'Smart OS', value: 'Android TV 11' },
    ],
  },
  {
    name: 'Running Shoes Ultra Boost',
    description: 'Lightweight, responsive running shoes with energy-returning cushioning and breathable mesh upper.',
    price: 8999,
    comparePrice: 12999,
    images: ['/product-shoes.jpg'],
    brand: 'SpeedRun',
    stock: 100,
    featured: true,
    tags: ['shoes', 'running', 'sports', 'footwear'],
    specifications: [
      { key: 'Material', value: 'Mesh Upper' },
      { key: 'Sole', value: 'Rubber' },
      { key: 'Weight', value: '280g' },
    ],
  },
  {
    name: 'Organic Face Moisturizer',
    description: 'Hydrating daily moisturizer with natural ingredients, SPF 15, and anti-aging properties.',
    price: 649,
    comparePrice: 999,
    images: ['/product-skincare.jpg'],
    brand: 'PureGlow',
    stock: 200,
    featured: false,
    tags: ['skincare', 'moisturizer', 'beauty', 'organic'],
    specifications: [
      { key: 'Volume', value: '50ml' },
      { key: 'Skin Type', value: 'All Skin Types' },
      { key: 'SPF', value: '15' },
    ],
  },
  {
    name: 'Gaming Laptop RTX 4060',
    description: 'High-performance gaming laptop with Intel Core i7, RTX 4060 graphics, 16GB RAM, and 144Hz display.',
    price: 84999,
    comparePrice: 99999,
    images: ['/product-laptop.jpg'],
    brand: 'GamePro',
    stock: 15,
    featured: true,
    tags: ['laptop', 'gaming', 'rtx', 'computer'],
    specifications: [
      { key: 'Processor', value: 'Intel Core i7-13700H' },
      { key: 'Graphics', value: 'NVIDIA RTX 4060' },
      { key: 'RAM', value: '16GB DDR5' },
    ],
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated vacuum flask keeps drinks hot for 12 hours or cold for 24 hours. Leak-proof and BPA-free.',
    price: 799,
    comparePrice: 1299,
    images: ['/product-bottle.jpg'],
    brand: 'EcoSip',
    stock: 300,
    featured: false,
    tags: ['bottle', 'water', 'kitchen', 'eco-friendly'],
    specifications: [
      { key: 'Capacity', value: '750ml' },
      { key: 'Material', value: '304 Stainless Steel' },
      { key: 'Insulation', value: 'Double Wall Vacuum' },
    ],
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick, non-slip yoga mat with alignment lines, carrying strap, and eco-friendly TPE material.',
    price: 1299,
    comparePrice: 1999,
    images: ['/product-yogamat.jpg'],
    brand: 'FlexFit',
    stock: 150,
    featured: true,
    tags: ['yoga', 'fitness', 'mat', 'exercise'],
    specifications: [
      { key: 'Thickness', value: '8mm' },
      { key: 'Material', value: 'TPE Eco-Friendly' },
      { key: 'Size', value: '183cm x 61cm' },
    ],
  },
  {
    name: 'Wireless Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with hot-swappable switches, wireless connectivity, and premium build.',
    price: 5999,
    comparePrice: 7999,
    images: ['/product-keyboard.jpg'],
    brand: 'KeyCraft',
    stock: 40,
    featured: true,
    tags: ['keyboard', 'mechanical', 'gaming', 'wireless'],
    specifications: [
      { key: 'Switches', value: 'Cherry MX Blue' },
      { key: 'Connection', value: 'Bluetooth/Wired' },
      { key: 'Battery', value: '200 hours' },
    ],
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracker with heart rate monitor, SpO2, GPS, sleep tracking, and 14-day battery life.',
    price: 3499,
    comparePrice: 4999,
    images: ['/product-watch.jpg'],
    brand: 'FitTrack',
    stock: 80,
    featured: true,
    tags: ['smartwatch', 'fitness', 'tracker', 'health'],
    specifications: [
      { key: 'Display', value: '1.4" AMOLED' },
      { key: 'Battery', value: '14 days' },
      { key: 'Water Resistance', value: '5ATM' },
    ],
  },
  {
    name: 'Organic Green Tea Pack',
    description: 'Premium organic green tea with antioxidants, 100 tea bags in eco-friendly packaging.',
    price: 449,
    comparePrice: 699,
    images: ['/product-greentea.jpg'],
    brand: 'NatureCup',
    stock: 500,
    featured: false,
    tags: ['tea', 'green tea', 'organic', 'beverage'],
    specifications: [
      { key: 'Quantity', value: '100 Tea Bags' },
      { key: 'Origin', value: 'Darjeeling' },
      { key: 'Type', value: 'Organic' },
    ],
  },
  {
    name: 'Leather Wallet Classic',
    description: 'Genuine leather bifold wallet with RFID protection, multiple card slots, and coin pocket.',
    price: 1199,
    comparePrice: 1999,
    images: ['/product-wallet.jpg'],
    brand: 'LuxeHide',
    stock: 120,
    featured: false,
    tags: ['wallet', 'leather', 'accessories', 'fashion'],
    specifications: [
      { key: 'Material', value: 'Genuine Leather' },
      { key: 'Card Slots', value: '8' },
      { key: 'RFID', value: 'Protected' },
    ],
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof portable speaker with 360-degree sound, 20-hour battery, and deep bass.',
    price: 2499,
    comparePrice: 3999,
    images: ['/product-speaker.jpg'],
    brand: 'BassBox',
    stock: 60,
    featured: true,
    tags: ['speaker', 'bluetooth', 'portable', 'audio'],
    specifications: [
      { key: 'Power', value: '20W' },
      { key: 'Battery', value: '20 hours' },
      { key: 'Waterproof', value: 'IPX7' },
    ],
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('Data cleared...');

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@shopmart.com',
      password: 'admin123',
      role: 'admin',
    });

    const normalUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      role: 'user',
    });

    console.log('Users created...');

    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created...`);

    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    const productsWithCategories = products.map((product, index) => ({
      ...product,
      category: createdCategories[index % createdCategories.length]._id,
    }));

    await Product.insertMany(productsWithCategories);
    console.log(`${productsWithCategories.length} products created...`);

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('Admin: admin@shopmart.com / admin123');
    console.log('User:  john@example.com / user123');
    console.log('========================================\n');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
