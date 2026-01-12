/**
 * Channel permissions configuration
 * Defines which roles can subscribe to which channels
 */

export type UserRole = 'admin' | 'center_owner' | 'doctor' | 'receptionist' | 'client' | 'free_user';

export interface ChannelPermission {
  pattern: RegExp;
  allowedRoles: UserRole[];
  requiresOwnership?: boolean; // For center/user-specific channels
}

export const channelPermissions: ChannelPermission[] = [
  // System channels - Admin only
  {
    pattern: /^system:maintenance$/,
    allowedRoles: ['admin', 'center_owner', 'doctor', 'receptionist']
  },
  {
    pattern: /^system:announcements$/,
    allowedRoles: ['admin', 'center_owner', 'doctor', 'receptionist', 'client', 'free_user']
  },

  // Center-specific channels - Require ownership or admin
  {
    pattern: /^center:([^:]+):queue$/,
    allowedRoles: ['admin', 'center_owner', 'doctor', 'receptionist'],
    requiresOwnership: true
  },
  {
    pattern: /^center:([^:]+):appointments$/,
    allowedRoles: ['admin', 'center_owner', 'doctor', 'receptionist'],
    requiresOwnership: true
  },
  {
    pattern: /^center:([^:]+):chat$/,
    allowedRoles: ['admin', 'center_owner', 'doctor', 'receptionist'],
    requiresOwnership: true
  },

  // User-specific channels - Require self or admin
  {
    pattern: /^user:([^:]+):notifications$/,
    allowedRoles: ['admin', 'center_owner', 'doctor', 'receptionist', 'client', 'free_user'],
    requiresOwnership: true
  },
  {
    pattern: /^user:([^:]+):appointments$/,
    allowedRoles: ['admin', 'center_owner', 'doctor', 'receptionist', 'client'],
    requiresOwnership: true
  },

  // Analytics channels - Staff only
  {
    pattern: /^analytics:realtime$/,
    allowedRoles: ['admin', 'center_owner']
  },
  {
    pattern: /^analytics:center:([^:]+)$/,
    allowedRoles: ['admin', 'center_owner'],
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
  centerId?: string
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

    // For center channels, check if user belongs to the center
    if (channel.startsWith('center:')) {
      if (!centerId || resourceId !== centerId) {
        return { 
          allowed: false, 
          reason: 'Can only subscribe to your center channels' 
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
  centerId?: string
): { allowed: string[]; denied: Array<{ channel: string; reason: string }> } {
  const allowed: string[] = [];
  const denied: Array<{ channel: string; reason: string }> = [];

  for (const channel of channels) {
    const result = canSubscribeToChannel(channel, userRole, userId, centerId);
    if (result.allowed) {
      allowed.push(channel);
    } else {
      denied.push({ channel, reason: result.reason || 'Access denied' });
    }
  }

  return { allowed, denied };
}
