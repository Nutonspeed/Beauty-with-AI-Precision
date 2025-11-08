/**
 * Channel permissions configuration
 * Defines which roles can subscribe to which channels
 */

export type UserRole = 'admin' | 'clinic_owner' | 'doctor' | 'receptionist' | 'patient' | 'free_user';

export interface ChannelPermission {
  pattern: RegExp;
  allowedRoles: UserRole[];
  requiresOwnership?: boolean; // For clinic/user-specific channels
}

export const channelPermissions: ChannelPermission[] = [
  // System channels - Admin only
  {
    pattern: /^system:maintenance$/,
    allowedRoles: ['admin', 'clinic_owner', 'doctor', 'receptionist']
  },
  {
    pattern: /^system:announcements$/,
    allowedRoles: ['admin', 'clinic_owner', 'doctor', 'receptionist', 'patient', 'free_user']
  },

  // Clinic-specific channels - Require ownership or admin
  {
    pattern: /^clinic:([^:]+):queue$/,
    allowedRoles: ['admin', 'clinic_owner', 'doctor', 'receptionist'],
    requiresOwnership: true
  },
  {
    pattern: /^clinic:([^:]+):appointments$/,
    allowedRoles: ['admin', 'clinic_owner', 'doctor', 'receptionist'],
    requiresOwnership: true
  },
  {
    pattern: /^clinic:([^:]+):chat$/,
    allowedRoles: ['admin', 'clinic_owner', 'doctor', 'receptionist'],
    requiresOwnership: true
  },

  // User-specific channels - Require self or admin
  {
    pattern: /^user:([^:]+):notifications$/,
    allowedRoles: ['admin', 'clinic_owner', 'doctor', 'receptionist', 'patient', 'free_user'],
    requiresOwnership: true
  },
  {
    pattern: /^user:([^:]+):appointments$/,
    allowedRoles: ['admin', 'clinic_owner', 'doctor', 'receptionist', 'patient'],
    requiresOwnership: true
  },

  // Analytics channels - Staff only
  {
    pattern: /^analytics:realtime$/,
    allowedRoles: ['admin', 'clinic_owner']
  },
  {
    pattern: /^analytics:clinic:([^:]+)$/,
    allowedRoles: ['admin', 'clinic_owner'],
    requiresOwnership: true
  }
];

/**
 * Extract resource ID from channel name based on pattern
 */
function extractResourceId(channel: string, pattern: RegExp): string | null {
  const match = channel.match(pattern);
  return match && match[1] ? match[1] : null;
}

/**
 * Check if user can subscribe to a channel
 */
export function canSubscribeToChannel(
  channel: string,
  userRole: UserRole,
  userId: string,
  clinicId?: string
): { allowed: boolean; reason?: string } {
  // Admin has access to everything
  if (userRole === 'admin') {
    return { allowed: true };
  }

  // Find matching permission rule
  const permission = channelPermissions.find(p => p.pattern.test(channel));
  
  if (!permission) {
    return { 
      allowed: false, 
      reason: `No permission rule found for channel: ${channel}` 
    };
  }

  // Check if user's role is allowed
  if (!permission.allowedRoles.includes(userRole)) {
    return { 
      allowed: false, 
      reason: `Role '${userRole}' is not allowed to subscribe to this channel` 
    };
  }

  // Check ownership if required
  if (permission.requiresOwnership) {
    const resourceId = extractResourceId(channel, permission.pattern);
    
    if (!resourceId) {
      return { 
        allowed: false, 
        reason: 'Could not extract resource ID from channel' 
      };
    }

    // For user channels, check if it's the user's own channel
    if (channel.startsWith('user:')) {
      if (resourceId !== userId) {
        return { 
          allowed: false, 
          reason: 'Can only subscribe to your own user channels' 
        };
      }
    }

    // For clinic channels, check if user belongs to the clinic
    if (channel.startsWith('clinic:')) {
      if (!clinicId || resourceId !== clinicId) {
        return { 
          allowed: false, 
          reason: 'Can only subscribe to your clinic channels' 
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Filter channels that user can subscribe to
 */
export function filterAllowedChannels(
  channels: string[],
  userRole: UserRole,
  userId: string,
  clinicId?: string
): { allowed: string[]; denied: Array<{ channel: string; reason: string }> } {
  const allowed: string[] = [];
  const denied: Array<{ channel: string; reason: string }> = [];

  for (const channel of channels) {
    const result = canSubscribeToChannel(channel, userRole, userId, clinicId);
    if (result.allowed) {
      allowed.push(channel);
    } else {
      denied.push({ channel, reason: result.reason || 'Access denied' });
    }
  }

  return { allowed, denied };
}
