export const channels = {
  system: {
    announcements: 'system:announcements',
    maintenance: 'system:maintenance',
  },
  center: {
    base: (centerId: string) => `center:${centerId}`,
    queue: (centerId: string) => `center:${centerId}:queue`,
    alerts: (centerId: string) => `center:${centerId}:alerts`,
  },
  user: {
    base: (userId: string) => `user:${userId}`,
    notifications: (userId: string) => `user:${userId}:notifications`,
  },
} as const;

// ChannelName intentionally omitted; use string for flexibility
