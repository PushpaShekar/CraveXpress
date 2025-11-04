import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../../../types';

interface IProductDocument extends Omit<IProduct, '_id'>, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one image'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one image is required',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Please provide a unit (kg, liters, pieces, etc.)'],
      default: 'pieces',
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for search and filtering
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, price: 1, 'ratings.average': -1 });

export default mongoose.model<IProductDocument>('Product', ProductSchema);

