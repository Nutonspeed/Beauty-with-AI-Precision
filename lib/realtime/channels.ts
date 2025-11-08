export const channels = {
  system: {
    announcements: 'system:announcements',
    maintenance: 'system:maintenance',
  },
  clinic: {
    base: (clinicId: string) => `clinic:${clinicId}`,
    queue: (clinicId: string) => `clinic:${clinicId}:queue`,
    alerts: (clinicId: string) => `clinic:${clinicId}:alerts`,
  },
  user: {
    base: (userId: string) => `user:${userId}`,
    notifications: (userId: string) => `user:${userId}:notifications`,
  },
} as const;

// ChannelName intentionally omitted; use string for flexibility
