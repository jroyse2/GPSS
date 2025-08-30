import { pool, supabase } from './database';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      
      try {
        // Use direct pool query for better error handling
        await pool.query(statement);
        console.log(`Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err);
        console.error('Statement:', statement);
      }
    }
    
    console.log('Database initialization completed');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Export as default
export default initializeDatabase;