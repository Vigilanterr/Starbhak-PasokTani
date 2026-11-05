export type AchievementStatus = 'ACHIEVED' | 'FEATURED' | 'REVOKED';

export interface FarmerAchievement {
  id: number;
  farmerId: number;
  farmerName?: string;
  farmerVillage?: string | null;
  title: string;
  description: string;
  badgeIcon: string | null;
  attainedAt: Date;
  status: AchievementStatus;
}