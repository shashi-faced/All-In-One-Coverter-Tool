export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  tier: SubscriptionTier;
  createdAt: string;
  emailVerified: boolean;
  googleId?: string;
}

export interface UserUsage {
  userId: string;
  conversionsToday: number;
  totalConversions: number;
  storageUsed: number;
  storageLimit: number;
  dailyConversionLimit: number;
  maxFileSize: number;
  resetDate: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}
