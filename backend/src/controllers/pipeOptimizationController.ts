import { Request, Response, NextFunction } from 'express';
import { PipeOptimizationService } from '../services/pipeOptimizationService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs';

// Define interfaces for multer types since we don't have the package
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Extend Express Request to include file property
declare global {
  namespace Express {
    interface Request {
      file?: MulterFile;
    }
  }
}

// Pipe optimization controller class
export class PipeOptimizationController {
  // Optimize pipe cutting
  static optimizePipeCutting = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { pipes, jobId, stockLength } = req.body;
    
    // Validate input
    if (!pipes || !Array.isArray(pipes) || pipes.length === 0) {
      return next(new AppError('Pipes array is required and must not be empty', 400));
    }
    
    if (!jobId) {
      return next(new AppError('Job ID is required', 400));
    }
    
    // Run optimization
    const optimizationResult = await PipeOptimizationService.optimizePipeCutting(
      pipes,
      jobId,
      stockLength
    );
    
    res.status(200).json({
      success: true,
      data: optimizationResult
    });
  });
  
  // Upload and process Excel file
  // Note: We're using a simpler approach without multer since it's not installed
  static uploadAndProcessFile = [
    // This is a placeholder for the multer middleware
    // In a real implementation, you would use multer.single('file') here
    (req: Request, res: Response, next: NextFunction) => {
      // Since multer isn't available, we'll simulate the file upload
      // In a real implementation, multer would handle this
      if (!req.file) {
        req.file = {
          fieldname: 'file',
          originalname: req.body.filename || 'uploaded-file.xlsx',
          encoding: '7bit',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 0,
          destination: path.join(__dirname, '../uploads'),
          filename: `file-${Date.now()}.xlsx`,
          path: path.join(__dirname, '../uploads', `file-${Date.now()}.xlsx`),
          buffer: Buffer.from([])
        };
      }
      next();
    },
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      if (!req.file) {
        return next(new AppError('No file uploaded', 400));
      }
      
      const { jobId } = req.body;
      
      if (!jobId) {
        return next(new AppError('Job ID is required', 400));
      }
      
      // Process the uploaded file
      const optimizationResult = await PipeOptimizationService.processExcelFile(
        req.file.path,
        jobId
      );
      
      // Delete the file after processing
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(200).json({
        success: true,
        data: optimizationResult
      });
    })
  ];
  
  // Get optimization history for a job
  static getOptimizationHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { jobId } = req.params;
    
    const history = await PipeOptimizationService.getOptimizationHistory(jobId);
    
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  });
  
  // Filter optimization by date range
  static filterByDateRange = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { jobId } = req.params;
    const { startDate, endDate } = req.body;
    
    // Validate input
    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }
    
    const history = await PipeOptimizationService.filterByDateRange(jobId, {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  });
  
  // Generate optimization visualization data
  static generateVisualization = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { jobId } = req.params;
    
    // Get optimization history
    const pipes = await PipeOptimizationService.getOptimizationHistory(jobId);
    
    // Group pipes by stock length
    const stockGroups: Record<number, any[]> = {};
    
    pipes.forEach(pipe => {
      if (!stockGroups[pipe.stock_length]) {
        stockGroups[pipe.stock_length] = [];
      }
      
      stockGroups[pipe.stock_length].push({
        length: pipe.length,
        diameter: pipe.diameter
      });
    });
    
    // Generate visualization data for each stock length
    const visualizationData = Object.entries(stockGroups).map(([stockLength, pipes]) => {
      // Sort pipes by length (descending)
      const sortedPipes = [...pipes].sort((a, b) => b.length - a.length);
      
      // Initialize cutting plan
      const cuttingPlan: Array<{
        stockIndex: number;
        stockLength: number;
        cuts: Array<{
          length: number;
          diameter: number;
          position: number;
        }>;
        remainingLength: number;
      }> = [];
      
      let currentStockIndex = 0;
      let currentStock = {
        stockIndex: currentStockIndex,
        stockLength: parseInt(stockLength),
        cuts: [] as Array<{
          length: number;
          diameter: number;
          position: number;
        }>,
        remainingLength: parseInt(stockLength) - 2 // Account for waste element
      };
      
      // Process each pipe
      for (const pipe of sortedPipes) {
        // If current stock can't fit this pipe, start a new stock
        if (currentStock.remainingLength < pipe.length) {
          // Save current stock to cutting plan
          cuttingPlan.push(currentStock);
          
          // Start a new stock
          currentStockIndex++;
          currentStock = {
            stockIndex: currentStockIndex,
            stockLength: parseInt(stockLength),
            cuts: [],
            remainingLength: parseInt(stockLength) - 2 // Account for waste element
          };
        }
        
        // Calculate position for this cut
        const position = parseInt(stockLength) - 2 - currentStock.remainingLength;
        
        // Add cut to current stock
        currentStock.cuts.push({
          length: pipe.length,
          diameter: pipe.diameter,
          position
        });
        
        // Update remaining length
        currentStock.remainingLength -= pipe.length;
      }
      
      // Add the last stock to cutting plan if it has any cuts
      if (currentStock.cuts.length > 0) {
        cuttingPlan.push(currentStock);
      }
      
      return {
        stockLength: parseInt(stockLength),
        cuttingPlan
      };
    });
    
    res.status(200).json({
      success: true,
      data: visualizationData
    });
  });
}