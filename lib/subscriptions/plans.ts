export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 2900,
    maxUsers: 5,
    maxCustomersPerMonth: 100,
    maxStorageGB: 10,
    features: ['Basic AI Analysis', 'Email Support', 'Mobile App'],
  },
  professional: {
    name: 'Professional',
    price: 9900,
    maxUsers: 20,
    maxCustomersPerMonth: -1,
    maxStorageGB: 50,
    features: [
      'Advanced AI Analysis',
      'Priority Support',
      'Custom Branding',
      'API Access',
      'Advanced Reports',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 29900,
    maxUsers: -1,
    maxCustomersPerMonth: -1,
    maxStorageGB: 200,
    features: [
      'All Professional Features',
      'Dedicated Support',
      'Custom Integration',
      'SLA Guarantee',
      'Multi-location',
    ],
  },
} as const;
