export interface Plan {
  id: string;
  name: string;
  tier: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  dailyConversionLimit: number;
  maxFileSize: number;
  storageLimit: number;
  priority: number;
  teamSeats?: number;
  apiAccess: boolean;
  stripePriceId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  stripeInvoiceId: string;
  invoiceUrl?: string;
  paidAt?: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'FREE',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '10 conversions per day',
      'Max file size: 100MB',
      'Basic formats',
      'Standard queue',
    ],
    dailyConversionLimit: 10,
    maxFileSize: 100 * 1024 * 1024,
    storageLimit: 500 * 1024 * 1024,
    priority: 0,
    apiAccess: false,
    stripePriceId: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'PRO',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited conversions',
      'Max file size: 5GB',
      'All formats',
      'Priority queue',
      'API access',
      'No ads',
    ],
    dailyConversionLimit: -1,
    maxFileSize: 5 * 1024 * 1024 * 1024,
    storageLimit: 10 * 1024 * 1024 * 1024,
    priority: 1,
    apiAccess: true,
    stripePriceId: 'price_pro_monthly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    price: 49.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited conversions',
      'Max file size: 5GB',
      'All formats + CAD',
      'Dedicated queue',
      'API access + SDK',
      'Team seats (5)',
      'Priority support',
      'SLA guarantee',
    ],
    dailyConversionLimit: -1,
    maxFileSize: 5 * 1024 * 1024 * 1024,
    storageLimit: 50 * 1024 * 1024 * 1024,
    priority: 2,
    teamSeats: 5,
    apiAccess: true,
    stripePriceId: 'price_enterprise_monthly',
  },
];
