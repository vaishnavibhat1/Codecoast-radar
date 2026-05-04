import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import User from '../core/users/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    next();
  } catch (error) {
    next(new AppError('Not authorized to access this route', 401));
  }
};

export const checkSubscription = (requiredTier) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (requiredTier === 'pro' && req.user.subscription.tier !== 'pro') {
      return next(new AppError('Pro subscription required', 403));
    }

    next();
  };
};
