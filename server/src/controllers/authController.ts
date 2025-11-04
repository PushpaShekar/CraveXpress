import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../../../types';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Validate role
    const userRole = role || UserRole.CUSTOMER;
    if (!Object.values(UserRole).includes(userRole)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone,
    });

    const token = generateToken((user._id as any).toString());

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken((user._id as any).toString());

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
      return;
    }

    const token = generateToken(req.user._id.toString());
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error: any) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=${error.message}`);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      addresses: user.addresses,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add address
// @route   POST /api/auth/address
// @access  Private
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { street, city, state, zipCode, country, coordinates, isDefault } = req.body;

    // If this is set as default, unset all others
    if (isDefault && user.addresses) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      coordinates,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();
    res.status(201).json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/auth/address/:addressId
// @access  Private
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.addresses) {
      res.status(404).json({ message: 'User or address not found' });
      return;
    }

    const address = (user.addresses as any).id(req.params.addressId);
    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    const { street, city, state, zipCode, country, coordinates, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.country = country || address.country;
    address.coordinates = coordinates || address.coordinates;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();
    res.json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.addresses) {
      res.status(404).json({ message: 'User or address not found' });
      return;
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id?.toString() !== req.params.addressId
    );

    await user.save();
    res.json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

