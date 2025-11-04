import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../../../types';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { isActive: true };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice as string);
    }

    // Rating filter
    if (req.query.minRating) {
      query['ratings.average'] = { $gte: parseFloat(req.query.minRating as string) };
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }

    // Sorting
    let sort: any = { createdAt: -1 };
    if (req.query.sort === 'price-asc') sort = { price: 1 };
    if (req.query.sort === 'price-desc') sort = { price: -1 };
    if (req.query.sort === 'rating') sort = { 'ratings.average': -1 };
    if (req.query.sort === 'popular') sort = { 'ratings.count': -1 };

    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email avatar');

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Seller, Admin)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, category, images, stock, unit, discount, tags } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      stock,
      unit,
      seller: req.user._id,
      discount: discount || 0,
      tags: tags || [],
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller - own products, Admin)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check ownership (sellers can only update their own products)
    if (
      req.user.role === UserRole.SELLER &&
      product.seller.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ message: 'Not authorized to update this product' });
      return;
    }

    const {
      name,
      description,
      price,
      category,
      images,
      stock,
      unit,
      discount,
      isActive,
      tags,
    } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.images = images || product.images;
    product.stock = stock !== undefined ? stock : product.stock;
    product.unit = unit || product.unit;
    product.discount = discount !== undefined ? discount : product.discount;
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    product.tags = tags || product.tags;

    await product.save();
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller - own products, Admin)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check ownership
    if (
      req.user.role === UserRole.SELLER &&
      product.seller.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ message: 'Not authorized to delete this product' });
      return;
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by seller
// @route   GET /api/products/seller/:sellerId
// @access  Public
export const getProductsBySeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      seller: req.params.sellerId,
      isActive: true,
    }).populate('seller', 'name email');

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller's own products
// @route   GET /api/products/my-products
// @access  Private (Seller)
export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

