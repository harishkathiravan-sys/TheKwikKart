import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
          ],
        }
      : {};

    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};

    const minPrice = req.query.minPrice ? { price: { $gte: Number(req.query.minPrice) } } : {};
    const maxPrice = req.query.maxPrice ? { price: { $lte: Number(req.query.maxPrice) } } : {};
    const priceFilter = req.query.minPrice && req.query.maxPrice
      ? { price: { $gte: Number(req.query.minPrice), $lte: Number(req.query.maxPrice) } }
      : { ...minPrice, ...maxPrice };

    const sortOption = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc': sortOption.price = 1; break;
        case 'price_desc': sortOption.price = -1; break;
        case 'rating': sortOption.ratings = -1; break;
        case 'newest': sortOption.createdAt = -1; break;
        case 'bestselling': sortOption.sold = -1; break;
        default: sortOption.createdAt = -1;
      }
    } else {
      sortOption.createdAt = -1;
    }

    const count = await Product.countDocuments({
      ...keyword,
      ...categoryFilter,
      ...priceFilter,
      isActive: true,
    });

    const products = await Product.find({
      ...keyword,
      ...categoryFilter,
      ...priceFilter,
      isActive: true,
    })
      .populate('category', 'name slug')
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      const { uploadToCloudinary } = await import('../middleware/upload.js');
      productData.images = [await uploadToCloudinary(req.file)];
    }
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      const { uploadToCloudinary } = await import('../middleware/upload.js');
      productData.images = [await uploadToCloudinary(req.file)];
    }
    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true,
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
