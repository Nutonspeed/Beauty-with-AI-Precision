/**
 * Privacy Settings Types
 * For user privacy controls and GDPR compliance
 */

export interface EmailPreferences {
  weeklyDigest: boolean;
  progressReports: boolean;
  goalAchievements: boolean;
  reEngagement: boolean;
  bookingReminders: boolean;
  analysisComplete: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
}

export interface PrivacySettings {
  id: string;
  userId: string;
  
  // Email Preferences
  emailPreferences: EmailPreferences;
  
  // Data Sharing
  shareDataForResearch: boolean;
  shareAnonymousData: boolean;
  allowThirdPartyAnalytics: boolean;
  
  // Privacy Consents
  privacyPolicyAccepted: boolean;
  privacyPolicyAcceptedAt: Date | null;
  termsOfServiceAccepted: boolean;
  termsOfServiceAcceptedAt: Date | null;
  marketingConsent: boolean;
  marketingConsentAt: Date | null;
  
  // Data Management
  dataExportRequested: boolean;
  dataExportRequestedAt: Date | null;
  dataExportCompletedAt: Date | null;
  accountDeletionRequested: boolean;
  accountDeletionRequestedAt: Date | null;
  accountDeletionScheduledFor: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  completedAt: Date | null;
  downloadUrl: string | null;
  expiresAt: Date | null;
  fileSize: number | null;
  errorMessage: string | null;
}

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  reason: string | null;
  requestedAt: Date;
  confirmationToken: string;
  confirmedAt: Date | null;
  scheduledFor: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
}

export interface PrivacyLog {
  id: string;
  userId: string;
  action: 'privacy_updated' | 'consent_given' | 'consent_revoked' | 'data_export_requested' | 'data_export_downloaded' | 'account_deletion_requested' | 'account_deletion_confirmed' | 'account_deletion_cancelled';
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
}
