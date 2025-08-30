import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://dvwmdutgtlewphqhqbhr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2d21kdXRndGxld3BocWhxYmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTAwMzUsImV4cCI6MjA3MTgyNjAzNX0.lqvUoimI9MI7do_fV16gzNfkW0lCrNft2wBGWiSZ_yg';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// For direct PostgreSQL access
// You need to get these values from your Supabase dashboard
// Project Settings > Database > Connection String
const dbConfig = {
  host: process.env.DB_HOST || 'db.dvwmdutgtlewphqhqbhr.supabase.co',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '_Snmmpmdlf03!', 
  ssl: { rejectUnauthorized: false }
};

// Create a PostgreSQL connection pool
export const pool = new Pool(dbConfig);

// Test the database connection
console.log('Attempting to connect to Supabase database...');
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connected successfully at:', result.rows[0].now);
  }
});