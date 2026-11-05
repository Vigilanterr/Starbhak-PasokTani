import { z } from 'zod';

export const achievementStatusSchema = z.enum(['ACHIEVED', 'FEATURED', 'REVOKED']);

export const createAchievementSchema = z.object({
  farmerId: z.coerce.number().int().positive(),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(3),
  badgeIcon: z.string().trim().max(100).optional(),
  attainedAt: z.coerce.date().optional(),
  status: achievementStatusSchema.default('ACHIEVED'),
});

export const updateAchievementSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(3).optional(),
    badgeIcon: z.string().trim().max(100).nullable().optional(),
    attainedAt: z.coerce.date().optional(),
    status: achievementStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;