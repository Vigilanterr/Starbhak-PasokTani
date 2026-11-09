import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(100),
  fullName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().max(20),
  role: z.enum(['FARMER', 'BUYER']).default('BUYER'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
