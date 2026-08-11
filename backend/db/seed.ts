import bcrypt from 'bcryptjs';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {pool} from '../src/config/db';

async function seed() {
  const schemaPath = resolve(__dirname, 'schema.sql');
  const schemaSql = readFileSync(schemaPath, 'utf8');
  await pool.query(schemaSql);

  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin','Sales','Warehouse','Accounts')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`);

  const pass = await bcrypt.hash('Admin@123', 10);
  await pool.query("INSERT INTO users(name,email,password_hash,role) VALUES('System Admin','admin@nova.local',$1,'Admin') ON CONFLICT(email) DO NOTHING", [pass]);
  await pool.query("INSERT INTO users(name,email,password_hash,role) VALUES('Sales User','sales@nova.local',$1,'Sales') ON CONFLICT(email) DO NOTHING", [await bcrypt.hash('Sales@123', 10)]);
  await pool.query("INSERT INTO users(name,email,password_hash,role) VALUES('Warehouse User','warehouse@nova.local',$1,'Warehouse') ON CONFLICT(email) DO NOTHING", [await bcrypt.hash('Warehouse@123', 10)]);
  await pool.query("INSERT INTO users(name,email,password_hash,role) VALUES('Accounts User','accounts@nova.local',$1,'Accounts') ON CONFLICT(email) DO NOTHING", [await bcrypt.hash('Accounts@123', 10)]);

  await pool.query("INSERT INTO customers(name,mobile,email,business_name,customer_type,status,follow_up_date) VALUES('Aarav Traders','9876543210','aarav@example.com','Aarav Wholesale','Wholesale','Active',CURRENT_DATE),('Shree Retail','9876501234','shree@example.com','Shree Mart','Retail','Lead',CURRENT_DATE),('Patel Distributors','9812345670','patel@example.com','Patel Distributors','Distributor','Active',CURRENT_DATE+2) ON CONFLICT DO NOTHING");

  await pool.query("INSERT INTO products(name,sku,category,unit_price,current_stock,min_stock_alert,warehouse_location) VALUES('Premium Rice 25kg','RICE-25','Groceries',1450,120,30,'A-01'),('Sunflower Oil 5L','OIL-5','Edible Oil',780,18,20,'B-02'),('Sugar 25kg','SUGAR-25','Groceries',1100,65,15,'A-03') ON CONFLICT(sku) DO NOTHING");

  console.log('Seed complete. Admin: admin@nova.local / Admin@123');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});