import {Pool, PoolClient} from 'pg';
import dotenv from 'dotenv'; dotenv.config();
export const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?.includes('neon.tech')?{rejectUnauthorized:false}:undefined});
export async function tx<T>(fn:(c:PoolClient)=>Promise<T>):Promise<T>{const c=await pool.connect();try{await c.query('BEGIN');const r=await fn(c);await c.query('COMMIT');return r}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}}
