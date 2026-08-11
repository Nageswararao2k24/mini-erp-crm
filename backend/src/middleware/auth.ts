import {Request,Response,NextFunction} from 'express'; import jwt from 'jsonwebtoken';
export type Role='Admin'|'Sales'|'Warehouse'|'Accounts'; export type AuthUser={id:number,name:string,email:string,role:Role};
export interface AuthedRequest extends Request{user?:AuthUser}
export function auth(req:AuthedRequest,res:Response,next:NextFunction){const h=req.headers.authorization;if(!h?.startsWith('Bearer '))return res.status(401).json({message:'Authentication required'});try{req.user=jwt.verify(h.slice(7),process.env.JWT_SECRET!) as AuthUser;next()}catch{return res.status(401).json({message:'Invalid or expired token'})}}
export const roles=(...allowed:Role[])=>(req:AuthedRequest,res:Response,next:NextFunction)=>{if(!req.user||!allowed.includes(req.user.role))return res.status(403).json({message:'You do not have permission for this action'});next()};
