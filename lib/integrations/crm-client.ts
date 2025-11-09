/**
 * CRM Client
 * Phase 2 Week 6-7 Task 6.1
 * 
 * Integration with external CRM systems (HubSpot, Salesforce, etc.)
 */

import { createServerClient } from '@/lib/supabase/server';

// =============================================
// Types
// =============================================

export interface CRMConfig {
  provider: 'hubspot' | 'salesforce' | 'custom';
  apiKey: string;
  apiUrl: string;
  enabled: boolean;
}

export interface CRMContact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  customFields?: Record<string, any>;
}

export interface CRMTask {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  contactId: string;
  type: 'follow_up' | 'treatment_review' | 'appointment' | 'general';
}

export interface AnalysisSyncData {
  analysisId: string;
  customerId: string;
  overallScore: number;
  concerns: string[];
  recommendations: string[];
  analysisDate: string;
  customerEmail: string;
}

export interface SyncResult {
  success: boolean;
  contactId?: string;
  taskId?: string;
  error?: string;
  timestamp: string;
}

// =============================================
// CRM Client Class
// =============================================

export class CRMClient {
  private config: CRMConfig;

  constructor(config: CRMConfig) {
    this.config = config;
  }

  /**
   * Test CRM connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.config.enabled) return false;

      const response = await fetch(`${this.config.apiUrl}/test`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('CRM connection test failed:', error);
      return false;
    }
  }

  /**
   * Sync contact to CRM
   */
  async syncContact(contact: CRMContact): Promise<SyncResult> {
    try {
      if (!this.config.enabled) {
        return {
          success: false,
          error: 'CRM integration disabled',
          timestamp: new Date().toISOString(),
        };
      }

      const endpoint = contact.id
        ? `${this.config.apiUrl}/contacts/${contact.id}`
        : `${this.config.apiUrl}/contacts`;

      const method = contact.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        throw new Error(`CRM API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        contactId: data.id || contact.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to sync contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Create follow-up task in CRM
   */
  async createTask(task: CRMTask): Promise<SyncResult> {
    try {
      if (!this.config.enabled) {
        return {
          success: false,
          error: 'CRM integration disabled',
          timestamp: new Date().toISOString(),
        };
      }

      const response = await fetch(`${this.config.apiUrl}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error(`CRM API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        taskId: data.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to create task:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Sync analysis results to CRM
   */
  async syncAnalysis(data: AnalysisSyncData): Promise<SyncResult> {
    try {
      // First, sync/update contact
      const contactResult = await this.syncContact({
        email: data.customerEmail,
        customFields: {
          last_analysis_date: data.analysisDate,
          overall_skin_score: data.overallScore,
          skin_concerns: data.concerns.join(', '),
        },
      });

      if (!contactResult.success) {
        return contactResult;
      }

      // Create follow-up task
      const taskResult = await this.createTask({
        title: 'Follow up on skin analysis',
        description: `Customer completed analysis with score ${data.overallScore}. Concerns: ${data.concerns.join(', ')}. Recommendations: ${data.recommendations.join(', ')}.`,
        dueDate: this.calculateFollowUpDate(7), // 7 days from now
        priority: this.determinePriority(data.overallScore),
        contactId: contactResult.contactId!,
        type: 'follow_up',
      });

      return {
        success: contactResult.success && taskResult.success,
        contactId: contactResult.contactId,
        taskId: taskResult.taskId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to sync analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Log sync operation to database
   */
  async logSync(
    operation: string,
    entityId: string,
    result: SyncResult
  ): Promise<void> {
    try {
      const supabase = await createServerClient();

      await supabase.from('crm_sync_logs').insert({
        operation,
        entity_id: entityId,
        success: result.success,
        error_message: result.error,
        crm_contact_id: result.contactId,
        crm_task_id: result.taskId,
        synced_at: result.timestamp,
      });
    } catch (error) {
      console.error('Failed to log sync:', error);
    }
  }

  // =============================================
  // Helper Methods
  // =============================================

  /**
   * Calculate follow-up date
   */
  private calculateFollowUpDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  }

  /**
   * Determine task priority based on score
   */
  private determinePriority(score: number): 'low' | 'medium' | 'high' {
    if (score < 50) return 'high';
    if (score < 70) return 'medium';
    return 'low';
  }
}

// =============================================
// Factory Function
// =============================================

/**
 * Create CRM client instance
 */
export async function createCRMClient(): Promise<CRMClient | null> {
  try {
    const supabase = await createServerClient();

    // Get CRM configuration from database
    const { data: config } = await supabase
      .from('crm_config')
      .select('*')
      .eq('enabled', true)
      .single();

    if (!config) {
      console.log('No CRM configuration found');
      return null;
    }

    return new CRMClient({
      provider: config.provider,
      apiKey: config.api_key,
      apiUrl: config.api_url,
      enabled: config.enabled,
    });
  } catch (error) {
    console.error('Failed to create CRM client:', error);
    return null;
  }
}

// =============================================
// Mock CRM Client (for testing)
// =============================================

export class MockCRMClient extends CRMClient {
  constructor() {
    super({
      provider: 'custom',
      apiKey: 'mock-key',
      apiUrl: 'https://mock-crm.example.com',
      enabled: true,
    });
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async syncContact(contact: CRMContact): Promise<SyncResult> {
    console.log('[Mock CRM] Syncing contact:', contact);
    return {
      success: true,
      contactId: `mock-contact-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  async createTask(task: CRMTask): Promise<SyncResult> {
    console.log('[Mock CRM] Creating task:', task);
    return {
      success: true,
      taskId: `mock-task-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}
