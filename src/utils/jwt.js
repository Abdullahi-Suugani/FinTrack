import jwt from 'jsonwebtoken'; import { env } from '../config/env.js';
export const signToken=(user)=>jwt.sign({userId:user.id,role:user.role},env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN});
