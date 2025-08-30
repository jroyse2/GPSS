// User roles
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ENGINEER = 'engineer',
  OPERATOR = 'operator'
}

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Job status
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Job priority
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

// Job interface
export interface Job {
  id: string;
  details: Record<string, any>;
  status: JobStatus;
  priority: JobPriority;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Pipe interface
export interface Pipe {
  id: string;
  length: number;
  diameter: number;
  stock_length: number;
  job_id: string;
  created_at: string;
  updated_at: string;
}

// Notification type
export type NotificationType = 'job_update' | 'system' | 'user' | 'alert';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// API response interface
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

// Optimization result interface
export interface OptimizationResult {
  stockPieces: number;
  wastage: number;
  totalLength: number;
  utilization: number;
  cuttingPlan: CuttingPlan[];
}

// Cutting plan interface
export interface CuttingPlan {
  stockIndex: number;
  stockLength: number;
  cuts: Cut[];
  remainingLength: number;
}

// Cut interface
export interface Cut {
  length: number;
  diameter: number;
  position: number;
}