import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, ICartItem, IAddress, OrderStatus, PaymentStatus, PaymentMethod } from '../../../types';

interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number,
  },
});

const OrderSchema = new Schema<IOrderDocument>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [CartItemSchema],
      required: true,
      validate: {
        validator: (v: ICartItem[]) => v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentId: {
      type: String,
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    deliveryDate: {
      type: Date,
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

export default mongoose.model<IOrderDocument>('Order', OrderSchema);

