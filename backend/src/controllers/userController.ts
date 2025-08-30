import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/userModel';
import { AuthService } from '../services/authService';
import { catchAsync, AppError } from '../middleware/errorHandler';

// Define enum values for UserRole since it's only a type in the model
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ENGINEER = 'engineer',
  OPERATOR = 'operator'
}

// User controller class
export class UserController {
  // Register a new user
  static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, role } = req.body;
    
    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return next(new AppError('Invalid role', 400));
    }
    
    const { user, token } = await AuthService.register(username, email, password, role);
    
    res.status(201).json({
      success: true,
      token,
      data: user
    });
  });
  
  // Login user
  static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }
    
    // Attempt login
    const { user, token, refreshToken } = await AuthService.login(email, password);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      token,
      data: user
    });
  });
  
  // Refresh token
  static refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies || req.body;
    
    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }
    
    const { token } = await AuthService.refreshToken(refreshToken);
    
    res.status(200).json({
      success: true,
      token
    });
  });
  
  // Logout user
  static logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
  
  // Get current user
  static getCurrentUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }
    
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  });
  
  // Get user by ID
  static getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    const user = await UserModel.findById(id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  });
  
  // Update user
  static updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id || req.user?.id;
    const { username, email, role } = req.body;
    
    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return next(new AppError('Invalid role', 400));
    }
    
    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return next(new AppError('User not found', 404));
    }
    
    // Update user
    const updatedUser = await UserModel.update(id, {
      username,
      email,
      role
    });
    
    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  });
  
  // Update password
  static updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id || req.user?.id;
    const { currentPassword, newPassword } = req.body;
    
    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Verify current password
    const isPasswordValid = await AuthService.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Current password is incorrect', 401));
    }
    
    // Hash new password
    const hashedPassword = await AuthService.hashPassword(newPassword);
    
    // Update password
    await UserModel.update(id, { password: hashedPassword });
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  });
  
  // Delete user
  static deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    const deleted = await UserModel.delete(id);
    
    if (!deleted) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  });
  
  // Get all users
  static getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserModel.getAll();
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json({
      success: true,
      count: usersWithoutPasswords.length,
      data: usersWithoutPasswords
    });
  });
}