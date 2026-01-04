import db from './db.js';

async function fixSchema() {
  try {
    console.log('Checking transactions table schema...');
    
    // Check if columns exist
    const [columns] = await db.query('SHOW COLUMNS FROM transactions');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('unique_code')) {
      console.log('Adding unique_code column...');
      await db.query('ALTER TABLE transactions ADD COLUMN unique_code INT DEFAULT 0');
    } else {
      console.log('unique_code column already exists.');
    }

    if (!columnNames.includes('final_price')) {
      console.log('Adding final_price column...');
      await db.query('ALTER TABLE transactions ADD COLUMN final_price DECIMAL(15, 2) DEFAULT 0');
    } else {
      console.log('final_price column already exists.');
    }

    console.log('Schema check completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating schema:', err);
    process.exit(1);
  }
}

fixSchema();