const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add or update required dependencies
packageJson.dependencies = {
  ...packageJson.dependencies,
  '@supabase/ssr': '^0.1.0',
  '@supabase/supabase-js': '^2.39.0', // Update to the latest version if needed
};

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Dependencies updated successfully!');
console.log('Please run "npm install" to install the new dependencies.');