import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product, rating, comment } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user._id,
    });

    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this product' });
      return;
    }

    const review = await Review.create({
      product,
      user: req.user._id,
      rating,
      comment,
    });

    // Update product ratings
    await updateProductRatings(product);

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json(populatedReview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this review' });
      return;
    }

    const { rating, comment } = req.body;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    await review.save();

    // Update product ratings
    await updateProductRatings(review.product.toString());

    const updatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.json(updatedReview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this review' });
      return;
    }

    const productId = review.product.toString();
    await review.deleteOne();

    // Update product ratings
    await updateProductRatings(productId);

    res.json({ message: 'Review removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update product ratings
const updateProductRatings = async (productId: string): Promise<void> => {
  const reviews = await Review.find({ product: productId });

  const product = await Product.findById(productId);
  if (!product) return;

  if (reviews.length === 0) {
    product.ratings.average = 0;
    product.ratings.count = 0;
  } else {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    product.ratings.average = totalRating / reviews.length;
    product.ratings.count = reviews.length;
  }

  await product.save();
};

