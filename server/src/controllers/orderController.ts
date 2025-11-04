import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { UserRole, OrderStatus, PaymentStatus } from '../../../types';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod, paymentId, notes } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    // Calculate total and verify stock
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({ message: `Product ${item.product} not found` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        return;
      }
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      customer: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentId,
      notes,
      paymentStatus: paymentId ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images price unit');

    res.status(201).json(populatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images price unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name images price unit')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images price unit seller');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check authorization
    const customerId = typeof order.customer === 'string' ? order.customer : (order.customer as any)._id?.toString();
    if (
      req.user.role === UserRole.CUSTOMER &&
      customerId !== (req.user._id as any).toString()
    ) {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin, Seller)
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, trackingNumber, deliveryDate } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.status = status || order.status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (deliveryDate) order.deliveryDate = deliveryDate;

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images price unit');

    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentStatus, paymentId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;

    await order.save();
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check authorization
    if (
      req.user.role === UserRole.CUSTOMER &&
      order.customer.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ message: 'Not authorized to cancel this order' });
      return;
    }

    // Can only cancel pending or confirmed orders
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      res.status(400).json({ message: 'Cannot cancel order in current status' });
      return;
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller orders
// @route   GET /api/orders/seller/orders
// @access  Private (Seller)
export const getSellerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all orders that contain products from this seller
    const orders = await Order.find()
      .populate({
        path: 'items.product',
        match: { seller: req.user._id },
      })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    // Filter orders that actually have products from this seller
    const sellerOrders = orders.filter((order) =>
      order.items.some((item) => item.product !== null)
    );

    res.json(sellerOrders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

