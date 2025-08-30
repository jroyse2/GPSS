import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Define a type for the decoded JWT payload from Supabase
interface SupabaseJwtPayload extends JwtPayload {
  sub?: string;
  role?: string;
  email?: string;
  aud?: string;
  exp?: number;
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // For Supabase tokens, we need to decode the token
    const decoded = jwt.decode(token) as SupabaseJwtPayload;
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    // Add user to request object
    req.user = {
      id: decoded.sub, // Supabase uses 'sub' for user ID
      role: decoded.role || 'user',
      email: decoded.email
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized, insufficient permissions' });
    }

    next();
  };
};