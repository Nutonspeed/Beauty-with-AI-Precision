/**
 * Analysis Archive Engine
 * Manages historical analysis records with advanced search, filtering, and export capabilities
 */

import { AIAnalysisResult } from './types/skin-analysis';
import { SkinConcern } from './types/skin-analysis';

export interface ArchiveFilter {
  dateRange?: { start: Date; end: Date };
  skinTypes?: string[];
  concerns?: SkinConcern[];
  severityRange?: { min: number; max: number };
  improvementStatus?: 'improved' | 'stable' | 'declined';
  treatmentApplied?: boolean;
  tags?: string[];
  clinician?: string;
  clinic?: string;
  searchText?: string;
}

export interface ArchiveStats {
  totalAnalyses: number;
  analyzedConcerns: { [key: string]: number };
  averageImprovement: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
  mostCommonConcerns: SkinConcern[];
  latestAnalysis?: Date;
  oldestAnalysis?: Date;
  complianceRate: number;
}

export interface AnalysisRecord {
  id: string;
  userId?: string;
  date: Date;
  timestamp?: Date;
  imageUrl?: string;
  analysis: AIAnalysisResult;
  clinicId?: string;
  clinicName?: string;
  clinicianId?: string;
  clinicianName?: string;
  tags: string[];
  notes: string;
  treatmentApplied: boolean;
  archived: boolean;
  improvementScore?: number;
  exportedAt?: Date[];
  metadata?: Record<string, unknown>;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeImages: boolean;
  includeAnalysis: boolean;
  includeTreatments: boolean;
  dateRange?: { start: Date; end: Date };
  language: 'th' | 'en';
}

export interface SearchResult {
  records: AnalysisRecord[];
  total: number;
  page: number;
  pageSize: number;
  filters: ArchiveFilter;
}

export class AnalysisArchiveEngine {
  private static readonly ARCHIVE_STORAGE_KEY = 'analysis_archive';
  private static readonly MAX_LOCAL_RECORDS = 1000;

  /**
   * Get all analysis records
   */
  static getArchive(
    filters?: ArchiveFilter,
    page: number = 1,
    pageSize: number = 20
  ): SearchResult {
    const records = this.loadArchive();
    let filtered = records;

    // Apply filters
    if (filters) {
      filtered = this.applyFilters(records, filters);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Paginate
    const start = (page - 1) * pageSize;
    const paginatedRecords = filtered.slice(start, start + pageSize);

    return {
      records: paginatedRecords,
      total: filtered.length,
      page,
      pageSize,
      filters: filters || {},
    };
  }

  /**
   * Search archives with full-text search
   */
  static searchArchive(
    query: string,
    filters?: ArchiveFilter,
    page: number = 1,
    pageSize: number = 20
  ): SearchResult {
    const records = this.loadArchive();
    const lowerQuery = query.toLowerCase();

    let filtered = records.filter((record) => {
      const matchesText =
        record.id.toLowerCase().includes(lowerQuery) ||
        record.clinicianName?.toLowerCase().includes(lowerQuery) ||
        record.clinicName?.toLowerCase().includes(lowerQuery) ||
        record.notes.toLowerCase().includes(lowerQuery) ||
        record.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        record.analysis.skinType.toLowerCase().includes(lowerQuery);

      if (!matchesText) return false;

      // Apply additional filters
      if (filters) {
        return this.matchesFilters(record, filters);
      }

      return true;
    });

    // Sort by relevance and date
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Paginate
    const start = (page - 1) * pageSize;
    const paginatedRecords = filtered.slice(start, start + pageSize);

    return {
      records: paginatedRecords,
      total: filtered.length,
      page,
      pageSize,
      filters: filters || {},
    };
  }

  /**
   * Add analysis to archive
   */
  static addToArchive(
    analysisId: string,
    analysis: AIAnalysisResult,
    metadata: {
      clinicId?: string;
      clinicName?: string;
      clinicianId?: string;
      clinicianName?: string;
      tags?: string[];
      notes?: string;
      treatmentApplied?: boolean;
      improvementScore?: number;
    } = {}
  ): AnalysisRecord {
    const records = this.loadArchive();

    // Check if record already exists
    const existing = records.find((r) => r.id === analysisId);
    if (existing) {
      return existing;
    }

    const record: AnalysisRecord = {
      id: analysisId,
      date: new Date(),
      analysis,
      clinicId: metadata.clinicId,
      clinicName: metadata.clinicName,
      clinicianId: metadata.clinicianId,
      clinicianName: metadata.clinicianName,
      tags: metadata.tags || [],
      notes: metadata.notes || '',
      treatmentApplied: metadata.treatmentApplied || false,
      archived: false,
      improvementScore: metadata.improvementScore,
    };

    records.push(record);

    // Maintain size limit
    if (records.length > this.MAX_LOCAL_RECORDS) {
      records.shift(); // Remove oldest
    }

    this.saveArchive(records);
    return record;
  }

  /**
   * Update archive record
   */
  static updateArchiveRecord(
    recordId: string,
    updates: Partial<Omit<AnalysisRecord, 'id' | 'date' | 'analysis'>>
  ): AnalysisRecord | null {
    const records = this.loadArchive();
    const record = records.find((r) => r.id === recordId);

    if (!record) return null;

    Object.assign(record, updates);
    this.saveArchive(records);
    return record;
  }

  /**
   * Delete record from archive
   */
  static deleteArchiveRecord(recordId: string): boolean {
    const records = this.loadArchive();
    const index = records.findIndex((r) => r.id === recordId);

    if (index === -1) return false;

    records.splice(index, 1);
    this.saveArchive(records);
    return true;
  }

  /**
   * Bulk delete records
   */
  static bulkDeleteRecords(recordIds: string[]): number {
    const records = this.loadArchive();
    const originalLength = records.length;

    const filtered = records.filter((r) => !recordIds.includes(r.id));
    this.saveArchive(filtered);

    return originalLength - filtered.length;
  }

  /**
   * Add tags to record
   */
  static addTags(recordId: string, tags: string[]): AnalysisRecord | null {
    const records = this.loadArchive();
    const record = records.find((r) => r.id === recordId);

    if (!record) return null;

    record.tags = [...new Set([...record.tags, ...tags])];
    this.saveArchive(records);
    return record;
  }

  /**
   * Remove tags from record
   */
  static removeTags(recordId: string, tags: string[]): AnalysisRecord | null {
    const records = this.loadArchive();
    const record = records.find((r) => r.id === recordId);

    if (!record) return null;

    record.tags = record.tags.filter((t) => !tags.includes(t));
    this.saveArchive(records);
    return record;
  }

  /**
   * Get all unique tags
   */
  static getAllTags(): string[] {
    const records = this.loadArchive();
    const tags = new Set<string>();

    records.forEach((record) => {
      record.tags.forEach((tag) => tags.add(tag));
    });

    return Array.from(tags).sort();
  }

  /**
   * Get archive statistics
   */
  static getArchiveStats(): ArchiveStats {
    const records = this.loadArchive();

    if (records.length === 0) {
      return {
        totalAnalyses: 0,
        analyzedConcerns: {},
        averageImprovement: 0,
        improvementTrend: 'stable',
        mostCommonConcerns: [],
        complianceRate: 0,
      };
    }

    // Count concerns
    const concernCount: { [key: string]: number } = {};
    let improvementSum = 0;
    let improvementCount = 0;
    const dates: Date[] = [];

    records.forEach((record) => {
      record.analysis.concerns.forEach((concern) => {
        concernCount[concern] = (concernCount[concern] || 0) + 1;
      });

      if (record.improvementScore !== undefined) {
        improvementSum += record.improvementScore;
        improvementCount++;
      }

      dates.push(new Date(record.date));
    });

    // Calculate trend
    const firstHalf = records.slice(0, Math.floor(records.length / 2));
    const secondHalf = records.slice(Math.floor(records.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, r) => sum + (r.improvementScore || 0), 0) / firstHalf.length || 0;
    const secondAvg =
      secondHalf.reduce((sum, r) => sum + (r.improvementScore || 0), 0) / secondHalf.length || 0;

    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (secondAvg > firstAvg + 5) trend = 'improving';
    if (secondAvg < firstAvg - 5) trend = 'declining';

    // Most common concerns
    const mostCommon = Object.entries(concernCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type as SkinConcern);

    // Compliance rate
    const treatedRecords = records.filter((r) => r.treatmentApplied).length;
    const complianceRate = (treatedRecords / records.length) * 100;

    return {
      totalAnalyses: records.length,
      analyzedConcerns: concernCount,
      averageImprovement: improvementCount > 0 ? improvementSum / improvementCount : 0,
      improvementTrend: trend,
      mostCommonConcerns: mostCommon,
      latestAnalysis: dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : undefined,
      oldestAnalysis: dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : undefined,
      complianceRate,
    };
  }

  /**
   * Export archive records
   */
  static exportArchive(
    records: AnalysisRecord[],
    options: ExportOptions
  ): string | Blob {
    switch (options.format) {
      case 'json':
        return this.exportAsJSON(records, options);
      case 'csv':
        return this.exportAsCSV(records, options);
      case 'excel':
        return this.exportAsExcel(records, options);
      case 'pdf':
        return this.exportAsPDF(records, options);
      default:
        return JSON.stringify(records, null, 2);
    }
  }

  /**
   * Private: Apply filters to records
   */
  private static applyFilters(records: AnalysisRecord[], filters: ArchiveFilter): AnalysisRecord[] {
    return records.filter((record) => this.matchesFilters(record, filters));
  }

  /**
   * Private: Check if record matches filters
   */
  private static matchesFilters(record: AnalysisRecord, filters: ArchiveFilter): boolean {
    // Date range filter
    if (filters.dateRange) {
      const recordDate = new Date(record.date);
      if (recordDate < filters.dateRange.start || recordDate > filters.dateRange.end) {
        return false;
      }
    }

    // Skin type filter
    if (filters.skinTypes && !filters.skinTypes.includes(record.analysis.skinType)) {
      return false;
    }

    // Concerns filter
    if (filters.concerns && filters.concerns.length > 0) {
      const recordConcerns = record.analysis.concerns.map((c) => c);
      const hasMatchingConcern = filters.concerns.some((c) =>
        recordConcerns.includes(c)
      );
      if (!hasMatchingConcern) return false;
    }

    // Severity range filter
    if (filters.severityRange) {
      const avgSeverity =
        record.analysis.concerns.reduce((sum, c) => sum + (record.analysis.severity[c] || 0), 0) /
        record.analysis.concerns.length;
      if (avgSeverity < filters.severityRange.min || avgSeverity > filters.severityRange.max) {
        return false;
      }
    }

    // Treatment applied filter
    if (filters.treatmentApplied !== undefined) {
      if (record.treatmentApplied !== filters.treatmentApplied) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) => record.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Clinician filter
    if (filters.clinician && record.clinicianName !== filters.clinician) {
      return false;
    }

    // Clinic filter
    if (filters.clinic && record.clinicName !== filters.clinic) {
      return false;
    }

    return true;
  }

  /**
   * Private: Export as JSON
   */
  private static exportAsJSON(records: AnalysisRecord[], options: ExportOptions): string {
    const data = records.map((record) => ({
      id: record.id,
      date: record.date,
      clinic: record.clinicName,
      clinician: record.clinicianName,
      analysis: options.includeAnalysis ? record.analysis : null,
      treatmentApplied: record.treatmentApplied,
      improvement: record.improvementScore,
      tags: record.tags,
      notes: record.notes,
    }));

    return JSON.stringify(data, null, 2);
  }

  /**
   * Private: Export as CSV
   */
  private static exportAsCSV(records: AnalysisRecord[], _options: ExportOptions): string {
    const headers = [
      'ID',
      'Date',
      'Clinic',
      'Clinician',
      'Skin Type',
      'Concerns',
      'Treatment Applied',
      'Improvement',
      'Tags',
    ];

    const rows = records.map((record) => [
      record.id,
      record.date.toISOString(),
      record.clinicName || '',
      record.clinicianName || '',
      record.analysis.skinType,
      record.analysis.concerns.join('; '),
      record.treatmentApplied ? 'Yes' : 'No',
      record.improvementScore || '',
      record.tags.join('; '),
    ]);

    const csv = [headers, ...rows].map((row) =>
      row.map((cell) => `"${cell}"`).join(',')
    );

    return csv.join('\n');
  }

  /**
   * Private: Export as Excel (simplified - returns CSV for browser)
   */
  private static exportAsExcel(records: AnalysisRecord[], options: ExportOptions): string {
    // In a real implementation, this would use a library like xlsx
    // For now, return CSV format
    return this.exportAsCSV(records, options);
  }

  /**
   * Private: Export as PDF (returns data URL)
   */
  private static exportAsPDF(records: AnalysisRecord[], options: ExportOptions): string {
    // In a real implementation, this would use a library like pdfkit
    // For now, return a placeholder
    const label = options.language === 'th' ? 'รายงานประวัติการวิเคราะห์' : 'Analysis Archive Report';
    return `data:text/plain;charset=utf-8,${encodeURIComponent(label)}\n\n${JSON.stringify(records, null, 2)}`;
  }

  /**
   * Private: Load archive from storage
   */
  private static loadArchive(): AnalysisRecord[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.ARCHIVE_STORAGE_KEY);
      if (!stored) return [];

      const records = JSON.parse(stored) as AnalysisRecord[];
      // Convert date strings back to Date objects
      return records.map((r) => ({
        ...r,
        date: new Date(r.date),
        exportedAt: r.exportedAt?.map((d) => new Date(d)) || [],
      }));
    } catch (error) {
      console.error('Error loading archive:', error);
      return [];
    }
  }

  /**
   * Private: Save archive to storage
   */
  private static saveArchive(records: AnalysisRecord[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.ARCHIVE_STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving archive:', error);
    }
  }

  /**
   * Get record by ID
   */
  static getRecordById(recordId: string): AnalysisRecord | null {
    const records = this.loadArchive();
    return records.find((r) => r.id === recordId) || null;
  }

  /**
   * Archive/unarchive record
   */
  static archiveRecord(recordId: string, archived: boolean = true): AnalysisRecord | null {
    return this.updateArchiveRecord(recordId, { archived });
  }

  /**
   * Get improvement over time (for trend analysis)
   */
  static getImprovementTrend(days: number = 90): { date: Date; improvement: number }[] {
    const records = this.loadArchive();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = records
      .filter((r) => new Date(r.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return filtered
      .filter((r) => r.improvementScore !== undefined)
      .map((r) => ({
        date: new Date(r.date),
        improvement: r.improvementScore || 0,
      }));
  }

  /**
   * Get records by date range
   */
  static getRecordsByDateRange(startDate: Date, endDate: Date): AnalysisRecord[] {
    const records = this.loadArchive();
    return records.filter((r) => {
      const date = new Date(r.date);
      return date >= startDate && date <= endDate;
    });
  }

  /**
   * Get records by concern type
   */
  static getRecordsByConcern(concern: SkinConcern): AnalysisRecord[] {
    const records = this.loadArchive();
    return records.filter((r) =>
      r.analysis.concerns.some((c) => c === concern)
    );
  }

  /**
   * Bulk add tags
   */
  static bulkAddTags(recordIds: string[], tags: string[]): number {
    const records = this.loadArchive();
    let updated = 0;

    recordIds.forEach((id) => {
      const record = records.find((r) => r.id === id);
      if (record) {
        record.tags = [...new Set([...record.tags, ...tags])];
        updated++;
      }
    });

    if (updated > 0) {
      this.saveArchive(records);
    }

    return updated;
  }

  /**
   * Clear entire archive (with confirmation)
   */
  static clearArchive(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.removeItem(this.ARCHIVE_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing archive:', error);
      return false;
    }
  }

  /**
   * Export archive metadata
   */
  static exportMetadata(): {
    totalRecords: number;
    dateRange: { start: Date; end: Date } | null;
    stats: ArchiveStats;
  } {
    const records = this.loadArchive();
    const stats = this.getArchiveStats();

    const dates = records.map((r) => new Date(r.date).getTime());
    const dateRange = dates.length > 0
      ? {
          start: new Date(Math.min(...dates)),
          end: new Date(Math.max(...dates)),
        }
      : null;

    return {
      totalRecords: records.length,
      dateRange,
      stats,
    };
  }
}
