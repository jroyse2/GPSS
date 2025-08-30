-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'operator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  details JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create pipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS pipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  length NUMERIC NOT NULL,
  diameter NUMERIC NOT NULL,
  stock_length NUMERIC NOT NULL,
  job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create initial admin user (password: admin123) if it doesn't exist
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2b$10$3JqABk8xZa96qz.9qZ4Rn.NwOQw.8SJ9VQw5K3Oa1nMCnNgTXkiTy', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Create sample job 1
INSERT INTO jobs (details, status, priority, user_id)
SELECT 
  jsonb_build_object(
    'title', 'Sample Job 1',
    'description', 'This is a sample job for testing',
    'client', 'Test Client',
    'salesOrderNumber', '357091'
  ),
  'pending',
  'low',
  (SELECT id FROM users WHERE username = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM jobs WHERE details->>'title' = 'Sample Job 1'
);

-- Create sample job 2
INSERT INTO jobs (details, status, priority, user_id)
SELECT 
  jsonb_build_object(
    'title', 'Sample Job 2',
    'description', 'This is a sample job for testing',
    'client', 'Test Client',
    'salesOrderNumber', '357092'
  ),
  'in_progress',
  'medium',
  (SELECT id FROM users WHERE username = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM jobs WHERE details->>'title' = 'Sample Job 2'
);

-- Create sample job 3
INSERT INTO jobs (details, status, priority, user_id)
SELECT 
  jsonb_build_object(
    'title', 'Sample Job 3',
    'description', 'This is a sample job for testing',
    'client', 'Test Client',
    'salesOrderNumber', '357093'
  ),
  'completed',
  'high',
  (SELECT id FROM users WHERE username = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM jobs WHERE details->>'title' = 'Sample Job 3'
);

-- Create sample job 4
INSERT INTO jobs (details, status, priority, user_id)
SELECT 
  jsonb_build_object(
    'title', 'Sample Job 4',
    'description', 'This is a sample job for testing',
    'client', 'Test Client',
    'salesOrderNumber', '357094'
  ),
  'cancelled',
  'low',
  (SELECT id FROM users WHERE username = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM jobs WHERE details->>'title' = 'Sample Job 4'
);

-- Create sample job 5
INSERT INTO jobs (details, status, priority, user_id)
SELECT 
  jsonb_build_object(
    'title', 'Sample Job 5',
    'description', 'This is a sample job for testing',
    'client', 'Test Client',
    'salesOrderNumber', '357095'
  ),
  'pending',
  'medium',
  (SELECT id FROM users WHERE username = 'admin')
WHERE NOT EXISTS (
  SELECT 1 FROM jobs WHERE details->>'title' = 'Sample Job 5'
);