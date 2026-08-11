import express from 'express'; import cors from 'cors'; import crypto from 'crypto'; import dotenv from 'dotenv'; import {errorHandler} from './middleware/error';
import auth from './modules/auth/routes'; import customers from './modules/customers/routes'; import products from './modules/products/routes'; import challans from './modules/challans/routes'; import invoices from './modules/invoices/routes'; import users from './modules/users/routes'; import dashboard from './modules/dashboard/routes'; import search from './modules/search/routes';
 dotenv.config();
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️ JWT_SECRET was not set. Generated a temporary secret for this run. Set JWT_SECRET in .env for production.');
}
const app=express(); app.use(cors({origin:process.env.FRONTEND_URL?.split(',')||true})); app.use(express.json());
app.get('/health',(_req,res)=>res.json({ok:true})); app.use('/api/auth',auth); app.use('/api/customers',customers); app.use('/api/products',products); app.use('/api/challans',challans); app.use('/api/invoices',invoices); app.use('/api/users',users); app.use('/api/dashboard',dashboard); app.use('/api/search',search); app.use(errorHandler);
const port=Number(process.env.PORT||5000); app.listen(port,()=>console.log(`API running on ${port}`));
