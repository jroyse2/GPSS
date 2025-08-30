import { PipeModel, Pipe } from '../models/pipeModel';
import { JobModel } from '../models/jobModel';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';
// Remove the csv-parse/sync import and implement a simple CSV parser

// Interface for pipe input
interface PipeInput {
  length: number;
  diameter: number;
  od?: string;
  partNumber?: string;
  drillOperations?: string;
}

// Interface for optimization result
interface OptimizationResult {
  stockPieces: number;
  wastage: number;
  totalLength: number;
  utilization: number;
  cuttingPlan: CuttingPlan[];
}

// Interface for cutting plan
interface CuttingPlan {
  stockIndex: number;
  stockLength: number;
  cuts: Cut[];
  remainingLength: number;
}

// Interface for individual cut
interface Cut {
  length: number;
  diameter: number;
  position: number;
  rfidCode?: string;
  partNumber?: string;
  drillOperations?: string;
}

// Interface for date range filter
interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

// Simple CSV parser function to replace csv-parse/sync
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  return lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const values = line.split(',');
    const record: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      record[header] = values[index] ? values[index].trim() : '';
    });
    
    return record;
  });
}

// Pipe optimization service class
export class PipeOptimizationService {
  // Stock lengths based on OD (in feet)
  private static STOCK_LENGTHS: Record<string, number> = {
    "1.9": 24,      // 24' for 1.9" OD
    "2.375": 25,    // 25' for 2.375" OD
    "3.5 .216": 32, // 32' for 3.5" OD x .216 wall
    "3.5 .12": 26   // 26' for 3.5" OD x .120 wall
  };
  
  // Waste element at the end of each stock pipe (in inches)
  private static WASTE_ELEMENT = 2;
  
  // Default stock length in mm
  private static DEFAULT_STOCK_LENGTH = 6000; // 6 meters in mm
  
  // Optimize pipe cutting
  static async optimizePipeCutting(
    pipes: PipeInput[],
    jobId: string,
    stockLength?: number
  ): Promise<OptimizationResult> {
    try {
      // Verify job exists
      const job = await JobModel.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      
      // Group pipes by OD type if OD is provided
      const pipeGroups: Record<string, PipeInput[]> = {};
      
      for (const pipe of pipes) {
        // Determine OD key if not provided
        let odKey = pipe.od || this.determineOdKey(pipe.diameter);
        
        if (!pipeGroups[odKey]) {
          pipeGroups[odKey] = [];
        }
        
        pipeGroups[odKey].push(pipe);
      }
      
      // If only one group or no OD provided, optimize as a single group
      if (Object.keys(pipeGroups).length <= 1 || !pipes[0].od) {
        return this.optimizePipeGroup(pipes, jobId, stockLength || this.DEFAULT_STOCK_LENGTH);
      }
      
      // Otherwise, optimize each group separately and combine results
      const results: OptimizationResult[] = [];
      
      for (const [odKey, pipeGroup] of Object.entries(pipeGroups)) {
        // Get stock length for this OD type
        const odStockLength = stockLength || (this.STOCK_LENGTHS[odKey] * 12); // Convert to inches
        
        // Optimize this group
        const result = await this.optimizePipeGroup(pipeGroup, jobId, odStockLength);
        results.push(result);
      }
      
      // Combine results
      const combinedResult: OptimizationResult = {
        stockPieces: results.reduce((sum, r) => sum + r.stockPieces, 0),
        wastage: results.reduce((sum, r) => sum + r.wastage, 0),
        totalLength: results.reduce((sum, r) => sum + r.totalLength, 0),
        utilization: results.reduce((sum, r) => sum + (r.utilization * r.totalLength), 0) / 
                    results.reduce((sum, r) => sum + r.totalLength, 0),
        cuttingPlan: results.flatMap(r => r.cuttingPlan)
      };
      
      return combinedResult;
    } catch (error) {
      console.error('Error optimizing pipe cutting:', error);
      throw error;
    }
  }
  
  // Optimize a group of pipes with the same OD
  private static async optimizePipeGroup(
    pipes: PipeInput[],
    jobId: string,
    stockLength: number
  ): Promise<OptimizationResult> {
    // Sort pipes by length (descending) for better optimization
    const sortedPipes = [...pipes].sort((a, b) => b.length - a.length);
    
    // Initialize optimization variables
    const cuttingPlan: CuttingPlan[] = [];
    let currentStockIndex = 0;
    let currentStock: CuttingPlan = {
      stockIndex: currentStockIndex,
      stockLength: stockLength,
      cuts: [],
      remainingLength: stockLength - this.WASTE_ELEMENT // Account for waste element
    };
    
    // Get job details
    const job = await JobModel.findById(jobId);
    
    // Process each pipe
    for (const pipe of sortedPipes) {
      // Check if pipe length is valid
      if (pipe.length > stockLength - this.WASTE_ELEMENT) {
        throw new AppError(`Pipe length (${pipe.length}) exceeds usable stock length (${stockLength - this.WASTE_ELEMENT})`, 400);
      }
      
      // If current stock can't fit this pipe, start a new stock
      if (currentStock.remainingLength < pipe.length) {
        // Save current stock to cutting plan
        cuttingPlan.push(currentStock);
        
        // Start a new stock
        currentStockIndex++;
        currentStock = {
          stockIndex: currentStockIndex,
          stockLength: stockLength,
          cuts: [],
          remainingLength: stockLength - this.WASTE_ELEMENT // Account for waste element
        };
      }
      
      // Calculate position for this cut
      const position = stockLength - this.WASTE_ELEMENT - currentStock.remainingLength;
      
      // Generate RFID code
      const salesOrder = job?.details?.salesOrderNumber || jobId.substring(0, 6);
      const odKey = pipe.od || this.determineOdKey(pipe.diameter);
      const rfidCode = `${salesOrder}-${odKey}-${pipe.length / 12}-${currentStock.cuts.length + 1}`;
      
      // Add cut to current stock
      currentStock.cuts.push({
        length: pipe.length,
        diameter: pipe.diameter,
        position,
        rfidCode,
        partNumber: pipe.partNumber,
        drillOperations: pipe.drillOperations
      });
      
      // Update remaining length
      currentStock.remainingLength -= pipe.length;
      
      // Save pipe to database
      await PipeModel.create({
        length: pipe.length,
        diameter: pipe.diameter,
        stock_length: stockLength,
        job_id: jobId
      });
    }
    
    // Add the last stock to cutting plan if it has any cuts
    if (currentStock.cuts.length > 0) {
      cuttingPlan.push(currentStock);
    }
    
    // Calculate optimization metrics
    const stockPieces = cuttingPlan.length;
    const totalLength = stockPieces * stockLength;
    const usedLength = pipes.reduce((sum, pipe) => sum + pipe.length, 0);
    const wastage = totalLength - usedLength;
    const utilization = (usedLength / totalLength) * 100;
    
    // Return optimization result
    return {
      stockPieces,
      wastage,
      totalLength,
      utilization,
      cuttingPlan
    };
  }
  
  // Determine OD key based on diameter
  private static determineOdKey(diameter: number): string {
    // This is a simplified mapping - in a real implementation, 
    // this would be more sophisticated based on actual OD measurements
    if (diameter <= 2.0) return "1.9";
    if (diameter <= 2.5) return "2.375";
    if (diameter <= 3.6 && diameter > 3.4) return "3.5 .12"; // Default to thinner wall
    return "3.5 .12"; // Default
  }
  
  // Get optimization history for a job
  static async getOptimizationHistory(jobId: string): Promise<Pipe[]> {
    try {
      // Verify job exists
      const job = await JobModel.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      
      // Get pipes for this job
      return await PipeModel.getByJobId(jobId);
    } catch (error) {
      console.error('Error getting optimization history:', error);
      throw error;
    }
  }
  
  // Process Excel file for pipe optimization
  static async processExcelFile(filePath: string, jobId: string): Promise<OptimizationResult> {
    try {
      // For CSV files, we'll use our custom parser
      if (filePath.toLowerCase().endsWith('.csv')) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const records = parseCSV(fileContent);
        
        // Extract pipe data from CSV
        const pipes: PipeInput[] = [];
        
        for (const record of records) {
          // Check if this is a pipe record
          if (record.DESCRIPTION && record.DESCRIPTION.includes('TUBE') && 
              record.PROCESS && record.PROCESS.includes('OD')) {
            
            try {
              // Extract OD from process field
              const odInfo = record.PROCESS.split('--')[0].trim();
              
              // Extract length from process field
              const lengthInfo = record.PROCESS.split('--')[1]?.trim() || '';
              let lengthFt = 0;
              
              if (lengthInfo && lengthInfo.includes('CUT:')) {
                const lengthStr = lengthInfo.split('CUT:')[1].trim().split(' ')[0];
                lengthFt = parseFloat(lengthStr);
              }
              
              // Extract quantity
              const qty = parseInt(record['PACK QTY'] || '0');
              
              // Extract drill operations
              const drillInfo = record.PROCESS.split('--')[2]?.trim() || 'NONE';
              
              // Determine OD key
              let odKey = '';
              if (odInfo.includes('1.9')) odKey = '1.9';
              else if (odInfo.includes('2.375')) odKey = '2.375';
              else if (odInfo.includes('3.5') && odInfo.includes('.216')) odKey = '3.5 .216';
              else if (odInfo.includes('3.5') && odInfo.includes('0.12')) odKey = '3.5 .12';
              
              // Add pipes to array
              if (lengthFt > 0 && qty > 0) {
                for (let i = 0; i < qty; i++) {
                  pipes.push({
                    length: lengthFt * 12, // Convert to inches
                    diameter: parseFloat(odKey.split(' ')[0]),
                    od: odKey,
                    partNumber: record['PART NUMBER'],
                    drillOperations: drillInfo
                  });
                }
              }
            } catch (e) {
              console.error('Error processing CSV record:', e);
            }
          }
        }
        
        // Run optimization
        return await this.optimizePipeCutting(pipes, jobId);
      } else {
        // For Excel files, we would use a library like exceljs
        // This is a placeholder for the Excel processing logic
        throw new AppError('Excel file processing not implemented yet', 501);
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw error;
    }
  }
  
  // Filter optimization by date range
  static async filterByDateRange(jobId: string, dateRange: DateRangeFilter): Promise<Pipe[]> {
    try {
      // Verify job exists
      const job = await JobModel.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      
      // Get pipes for this job within date range
      const pipes = await PipeModel.getByJobId(jobId);
      
      // Filter by date range
      return pipes.filter(pipe => {
        const pipeDate = new Date(pipe.created_at);
        return pipeDate >= dateRange.startDate && pipeDate <= dateRange.endDate;
      });
    } catch (error) {
      console.error('Error filtering by date range:', error);
      throw error;
    }
  }
}