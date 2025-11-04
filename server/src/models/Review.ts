import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '../../../types';

interface IReviewDocument extends Omit<IReview, '_id'>, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure user can only review a product once
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model<IReviewDocument>('Review', ReviewSchema);

