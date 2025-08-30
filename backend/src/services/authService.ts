import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, User, UserRole } from '../models/userModel';
import { AppError } from '../middleware/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

// JWT secret and expiration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Auth service class
export class AuthService {
  // Register a new user
  static async register(username: string, email: string, password: string, role: UserRole = UserRole.OPERATOR): Promise<{ user: Omit<User, 'password'>, token: string }> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError('User with this email already exists', 400);
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const user = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        role
      });
      
      // Generate token
      const token = this.generateToken(user);
      
      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  // Login user
  static async login(email: string, password: string): Promise<{ user: Omit<User, 'password'>, token: string, refreshToken: string }> {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);
      
      // Return user without password and tokens
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token, refreshToken };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  // Refresh token
  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
      
      // Find user
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        throw new AppError('Invalid refresh token', 401);
      }
      
      // Generate new access token
      const token = this.generateToken(user);
      
      return { token };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }
  
  // Generate JWT token
  private static generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }
  
  // Generate refresh token
  private static generateRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );
  }
  
  // Verify token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
  
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  
  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}