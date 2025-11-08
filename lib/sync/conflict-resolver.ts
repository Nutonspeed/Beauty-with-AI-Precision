/**
 * Conflict Resolver for Offline→Online Sync
 * Handles conflicts when multiple sales staff edit same data offline
 * 
 * Strategy:
 * - Last-Write-Wins: Timestamp-based for simple fields
 * - Manual Resolution: For critical data (lead status, follow-up dates)
 * - Auto-Merge: For arrays (interaction_history, notes)
 * 
 * Supports: 120 sales staff concurrent offline edits
 */

import type { Lead, MultiTenantSkinAnalysis } from '@/types/multi-tenant';
import type { OfflineAnalysis, OfflineLead } from '@/lib/db/indexed-db';

// ============================================================================
// Types
// ============================================================================

export type ConflictResolutionStrategy =
  | 'last_write_wins'
  | 'server_wins'
  | 'client_wins'
  | 'merge'
  | 'manual';

export interface ConflictContext {
  resource_type: 'analysis' | 'lead';
  resource_id: string;
  server_data: any;
  client_data: any;
  server_timestamp: number;
  client_timestamp: number;
}

export interface ConflictResolution {
  strategy: ConflictResolutionStrategy;
  resolved_data: any;
  conflicts_found: ConflictDetail[];
  requires_manual_review: boolean;
}

export interface ConflictDetail {
  field: string;
  server_value: any;
  client_value: any;
  resolved_value: any;
  resolution_strategy: ConflictResolutionStrategy;
}

// ============================================================================
// Conflict Resolver Class
// ============================================================================

export class ConflictResolver {
  /**
   * Resolve conflicts for Lead
   */
  resolveLeadConflict(
    serverLead: Lead,
    clientLead: OfflineLead,
    strategy: ConflictResolutionStrategy = 'last_write_wins'
  ): ConflictResolution {
    const conflicts: ConflictDetail[] = [];
    let requiresManualReview = false;

    // Check for critical field conflicts
    const criticalFields = new Set<keyof Lead>([
      'status',
      'follow_up_date',
      'converted_to_customer',
      'converted_at',
    ]);

    const resolvedLead = { ...serverLead };

    // Get timestamps
    const serverTimestamp = new Date(serverLead.updated_at).getTime();
    const clientTimestamp = clientLead.offline_timestamp;

    // Check each field for conflicts
    for (const key of Object.keys(clientLead)) {
      const field = key as keyof Lead;

      // Skip offline-specific fields
      if (
        field === 'offline_created' ||
        field === 'offline_timestamp' ||
        field === 'synced' ||
        field === 'sync_attempts' ||
        field === 'last_sync_error'
      ) {
        continue;
      }

      const serverValue = serverLead[field];
      const clientValue = clientLead[field];

      // No conflict if values are same
      if (JSON.stringify(serverValue) === JSON.stringify(clientValue)) {
        continue;
      }

      // Handle conflict based on field type
      let resolvedValue: any;
      let fieldStrategy: ConflictResolutionStrategy;

      // Critical fields - require manual review
      if (criticalFields.has(field)) {
        requiresManualReview = true;

        if (strategy === 'last_write_wins') {
          resolvedValue = clientTimestamp > serverTimestamp ? clientValue : serverValue;
          fieldStrategy = 'last_write_wins';
        } else if (strategy === 'server_wins') {
          resolvedValue = serverValue;
          fieldStrategy = 'server_wins';
        } else if (strategy === 'client_wins') {
          resolvedValue = clientValue;
          fieldStrategy = 'client_wins';
        } else {
          resolvedValue = serverValue; // Default to server
          fieldStrategy = 'manual';
        }
      }
      // Array fields - merge
      else if (Array.isArray(serverValue) && Array.isArray(clientValue)) {
        if (field === 'interaction_history') {
          // Merge interaction histories by unique dates
          const merged = this.mergeInteractionHistories(serverValue, clientValue);
          resolvedValue = merged;
          fieldStrategy = 'merge';
        } else {
          // For other arrays, use last write wins
          resolvedValue = clientTimestamp > serverTimestamp ? clientValue : serverValue;
          fieldStrategy = 'last_write_wins';
        }
      }
      // Simple fields - last write wins
      else {
        if (strategy === 'last_write_wins') {
          resolvedValue = clientTimestamp > serverTimestamp ? clientValue : serverValue;
          fieldStrategy = 'last_write_wins';
        } else if (strategy === 'server_wins') {
          resolvedValue = serverValue;
          fieldStrategy = 'server_wins';
        } else {
          resolvedValue = clientValue;
          fieldStrategy = 'client_wins';
        }
      }

      // Record conflict
      conflicts.push({
        field,
        server_value: serverValue,
        client_value: clientValue,
        resolved_value: resolvedValue,
        resolution_strategy: fieldStrategy,
      });

      // Apply resolution
      (resolvedLead as any)[field] = resolvedValue;
    }

    return {
      strategy,
      resolved_data: resolvedLead,
      conflicts_found: conflicts,
      requires_manual_review: requiresManualReview,
    };
  }

  /**
   * Resolve conflicts for Analysis
   */
  resolveAnalysisConflict(
    serverAnalysis: MultiTenantSkinAnalysis,
    clientAnalysis: OfflineAnalysis,
    strategy: ConflictResolutionStrategy = 'last_write_wins'
  ): ConflictResolution {
    const conflicts: ConflictDetail[] = [];
    let requiresManualReview = false;

    // Analyses are usually immutable after creation
    // Only notes and recommendations can be edited
    const editableFields: (keyof MultiTenantSkinAnalysis)[] = ['notes', 'recommendations'];

    const resolvedAnalysis = { ...serverAnalysis };

    // Get timestamps
    const serverTimestamp = new Date(serverAnalysis.updated_at).getTime();
    const clientTimestamp = clientAnalysis.offline_timestamp;

    // Check editable fields for conflicts
    for (const field of editableFields) {
      const serverValue = serverAnalysis[field];
      const clientValue = clientAnalysis[field];

      // No conflict if values are same
      if (JSON.stringify(serverValue) === JSON.stringify(clientValue)) {
        continue;
      }

      let resolvedValue: any;
      let fieldStrategy: ConflictResolutionStrategy;

      // Notes - concatenate both (preserve all edits)
      if (field === 'notes') {
        if (typeof serverValue === 'string' && typeof clientValue === 'string') {
          resolvedValue = this.mergeNotes(serverValue, clientValue);
          fieldStrategy = 'merge';
        } else {
          resolvedValue = clientTimestamp > serverTimestamp ? clientValue : serverValue;
          fieldStrategy = 'last_write_wins';
        }
      }
      // Recommendations - merge arrays
      else if (field === 'recommendations' && Array.isArray(serverValue) && Array.isArray(clientValue)) {
        resolvedValue = this.mergeArraysUnique(serverValue, clientValue);
        fieldStrategy = 'merge';
      }
      // Other fields - last write wins
      else {
        resolvedValue = clientTimestamp > serverTimestamp ? clientValue : serverValue;
        fieldStrategy = 'last_write_wins';
      }

      // Record conflict
      conflicts.push({
        field,
        server_value: serverValue,
        client_value: clientValue,
        resolved_value: resolvedValue,
        resolution_strategy: fieldStrategy,
      });

      // Apply resolution
      (resolvedAnalysis as any)[field] = resolvedValue;
    }

    return {
      strategy,
      resolved_data: resolvedAnalysis,
      conflicts_found: conflicts,
      requires_manual_review: requiresManualReview,
    };
  }

  /**
   * Merge interaction histories (unique by date)
   */
  private mergeInteractionHistories(
    serverHistory: any[],
    clientHistory: any[]
  ): any[] {
    const merged = [...serverHistory];
    const existingInteractions = new Set(
      serverHistory.map(
        (interaction) => `${interaction.date}_${interaction.type}`
      )
    );

    for (const clientInteraction of clientHistory) {
      const key = `${clientInteraction.date}_${clientInteraction.type}`;
      if (!existingInteractions.has(key)) {
        merged.push(clientInteraction);
        existingInteractions.add(key);
      }
    }

    // Sort by date descending
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Merge notes (concatenate with separator)
   */
  private mergeNotes(serverNotes: string, clientNotes: string): string {
    // If one is empty, return the other
    if (!serverNotes) return clientNotes;
    if (!clientNotes) return serverNotes;

    // If they're identical, return one
    if (serverNotes === clientNotes) return serverNotes;

    // Check if client notes are already contained in server notes
    if (serverNotes.includes(clientNotes)) return serverNotes;
    if (clientNotes.includes(serverNotes)) return clientNotes;

    // Merge with separator
    return `${serverNotes}\n\n--- Offline Edit ---\n${clientNotes}`;
  }

  /**
   * Merge arrays with unique values
   */
  private mergeArraysUnique<T>(serverArray: T[], clientArray: T[]): T[] {
    const merged = new Set(serverArray.map(item => JSON.stringify(item)));
    for (const item of clientArray) {
      merged.add(JSON.stringify(item));
    }
    return Array.from(merged).map(item => JSON.parse(item));
  }

  /**
   * Check if manual resolution is required
   */
  requiresManualResolution(resolution: ConflictResolution): boolean {
    return resolution.requires_manual_review || resolution.conflicts_found.length > 3;
  }

  /**
   * Generate conflict report for user
   */
  generateConflictReport(resolution: ConflictResolution): string {
    if (resolution.conflicts_found.length === 0) {
      return 'No conflicts detected.';
    }

    let report = `Found ${resolution.conflicts_found.length} conflict(s):\n\n`;

    for (const [index, conflict] of resolution.conflicts_found.entries()) {
      report += `${index + 1}. Field: ${conflict.field}\n`;
      report += `   Server: ${JSON.stringify(conflict.server_value)}\n`;
      report += `   Your Edit: ${JSON.stringify(conflict.client_value)}\n`;
      report += `   Resolved: ${JSON.stringify(conflict.resolved_value)}\n`;
      report += `   Strategy: ${conflict.resolution_strategy}\n\n`;
    }

    if (resolution.requires_manual_review) {
      report += '⚠️ Manual review recommended for critical field conflicts.\n';
    }

    return report;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let conflictResolverInstance: ConflictResolver | null = null;

export function getConflictResolver(): ConflictResolver {
  conflictResolverInstance ??= new ConflictResolver();
  return conflictResolverInstance;
}

export function resetConflictResolver(): void {
  conflictResolverInstance = null;
}
