'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  AnalysisArchiveEngine,
  ArchiveFilter,
  AnalysisRecord,
  ArchiveStats,
  SearchResult,
  ExportOptions,
} from '@/lib/analysis-archive-engine';
import { SkinConcern } from '@/types';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Tag,
  Calendar,
  User,
  Building,
  TrendingUp,
  Archive,
  Restore,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface Props {
  language?: 'th' | 'en';
}

interface ArchiveViewMode {
  type: 'list' | 'grid' | 'timeline';
}

const translations = {
  th: {
    title: 'ประวัติการวิเคราะห์',
    search: 'ค้นหาประวัติ',
    searchPlaceholder: 'ค้นหา ID, คลินิก, บันทึก...',
    filter: 'ตัวกรอง',
    export: 'ส่งออก',
    delete: 'ลบ',
    selectAll: 'เลือกทั้งหมด',
    dateRange: 'ช่วงวันที่',
    skinTypes: 'ประเภทผิว',
    concerns: 'ปัญหาผิว',
    severity: 'ความรุนแรง',
    treatment: 'ใช้การรักษา',
    tags: 'แท็ก',
    clinician: 'เพศแพทย์',
    clinic: 'คลินิก',
    stats: 'สถิติ',
    totalAnalyses: 'วิเคราะห์ทั้งหมด',
    averageImprovement: 'การปรับปรุงเฉลี่ย',
    improvementTrend: 'แนวโน้มการปรับปรุง',
    complianceRate: 'อัตราการปฏิบัติตาม',
    improving: 'กำลังปรับปรุง',
    stable: 'เสถียร',
    declining: 'ลดลง',
    noRecords: 'ไม่พบบันทึก',
    loading: 'กำลังโหลด...',
    confirmDelete: 'ยืนยันการลบ',
    deleteMessage: 'คุณแน่ใจหรือว่าต้องการลบบันทึกนี้?',
    yes: 'ใช่',
    no: 'ไม่ใช่',
    archive: 'เก็บถาวร',
    restore: 'คืนกลับ',
    addTags: 'เพิ่มแท็ก',
    removeTags: 'ลบแท็ก',
    bulkActions: 'การทำงานหลายรายการ',
    formatJSON: 'JSON',
    formatCSV: 'CSV',
    formatExcel: 'Excel',
    formatPDF: 'PDF',
    exportSuccess: 'ส่งออกเรียบร้อย',
    mostCommonConcerns: 'ปัญหาที่พบบ่อยที่สุด',
    analysisDate: 'วันที่วิเคราะห์',
    skinType: 'ประเภทผิว',
    improvement: 'การปรับปรุง',
    treated: 'ทำการรักษา',
    viewDetails: 'ดูรายละเอียด',
    page: 'หน้า',
    of: 'จาก',
    items: 'รายการ',
    listView: 'มุมมองรายการ',
    gridView: 'มุมมองกริด',
    timelineView: 'มุมมองไทม์ไลน์',
    noSelection: 'ไม่มีการเลือก',
    itemsSelected: 'รายการที่เลือก',
  },
  en: {
    title: 'Analysis Archive',
    search: 'Search Archive',
    searchPlaceholder: 'Search ID, clinic, notes...',
    filter: 'Filters',
    export: 'Export',
    delete: 'Delete',
    selectAll: 'Select All',
    dateRange: 'Date Range',
    skinTypes: 'Skin Types',
    concerns: 'Concerns',
    severity: 'Severity',
    treatment: 'Treatment Applied',
    tags: 'Tags',
    clinician: 'Clinician',
    clinic: 'Clinic',
    stats: 'Statistics',
    totalAnalyses: 'Total Analyses',
    averageImprovement: 'Average Improvement',
    improvementTrend: 'Improvement Trend',
    complianceRate: 'Compliance Rate',
    improving: 'Improving',
    stable: 'Stable',
    declining: 'Declining',
    noRecords: 'No records found',
    loading: 'Loading...',
    confirmDelete: 'Confirm Delete',
    deleteMessage: 'Are you sure you want to delete this record?',
    yes: 'Yes',
    no: 'No',
    archive: 'Archive',
    restore: 'Restore',
    addTags: 'Add Tags',
    removeTags: 'Remove Tags',
    bulkActions: 'Bulk Actions',
    formatJSON: 'JSON',
    formatCSV: 'CSV',
    formatExcel: 'Excel',
    formatPDF: 'PDF',
    exportSuccess: 'Export successful',
    mostCommonConcerns: 'Most Common Concerns',
    analysisDate: 'Analysis Date',
    skinType: 'Skin Type',
    improvement: 'Improvement',
    treated: 'Treated',
    viewDetails: 'View Details',
    page: 'Page',
    of: 'of',
    items: 'items',
    listView: 'List View',
    gridView: 'Grid View',
    timelineView: 'Timeline View',
    noSelection: 'No selection',
    itemsSelected: 'items selected',
  },
};

export const ArchiveManagement: React.FC<Props> = ({ language = 'en' }) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ArchiveFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<ArchiveViewMode['type']>('list');
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial data
  React.useEffect(() => {
    loadArchiveData();
  }, []);

  const loadArchiveData = useCallback(() => {
    setLoading(true);
    try {
      const archiveStats = AnalysisArchiveEngine.getArchiveStats();
      setStats(archiveStats);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search and filter results
  const searchResults: SearchResult = useMemo(() => {
    if (searchQuery.trim()) {
      return AnalysisArchiveEngine.searchArchive(
        searchQuery,
        filters,
        currentPage,
        pageSize
      );
    } else {
      return AnalysisArchiveEngine.getArchive(filters, currentPage, pageSize);
    }
  }, [searchQuery, filters, currentPage, pageSize]);

  const handleSelectRecord = (recordId: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === searchResults.records.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(
        new Set(searchResults.records.map((r) => r.id))
      );
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm(t.deleteMessage)) {
      AnalysisArchiveEngine.deleteArchiveRecord(recordId);
      setSelectedRecords((prev) => {
        const newSet = new Set(prev);
        newSet.delete(recordId);
        return newSet;
      });
      loadArchiveData();
    }
  };

  const handleBulkDelete = () => {
    if (selectedRecords.size === 0) return;
    if (confirm(`${t.confirmDelete}? (${selectedRecords.size} ${t.items})`)) {
      AnalysisArchiveEngine.bulkDeleteRecords(Array.from(selectedRecords));
      setSelectedRecords(new Set());
      loadArchiveData();
    }
  };

  const handleArchiveRecord = (recordId: string, archived: boolean) => {
    AnalysisArchiveEngine.archiveRecord(recordId, archived);
    loadArchiveData();
  };

  const handleExport = (format: ExportOptions['format']) => {
    const data = AnalysisArchiveEngine.exportArchive(searchResults.records, {
      format,
      includeImages: true,
      includeAnalysis: true,
      includeTreatments: true,
      language,
    });

    // Convert to downloadable format
    if (typeof data === 'string') {
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        format === 'pdf'
          ? data
          : `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`
      );
      element.setAttribute('download', `archive-export.${format === 'excel' ? 'xlsx' : format}`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const renderStatCard = (
    label: string,
    value: string | number,
    icon: React.ReactNode,
    color: string
  ) => (
    <div className={`bg-white rounded-lg p-4 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'declining':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const renderRecordCard = (record: AnalysisRecord) => (
    <div
      key={record.id}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selectedRecords.has(record.id)}
            onChange={() => handleSelectRecord(record.id)}
            className="mt-1"
          />
          <div>
            <p className="font-semibold text-gray-900">{record.id}</p>
            <p className="text-sm text-gray-600">
              {new Date(record.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
            </p>
            {record.clinicName && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Building className="w-4 h-4" />
                {record.clinicName}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {record.treatmentApplied && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
              {t.treated}
            </span>
          )}
        </div>
      </div>

      {record.tags.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleArchiveRecord(record.id, !record.archived)}
          className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
        >
          {record.archived ? t.restore : t.archive}
        </button>
        <button
          onClick={() => handleDeleteRecord(record.id)}
          className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded"
        >
          {t.delete}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          >
            {/* List icon */}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          >
            {/* Grid icon */}
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          >
            {/* Timeline icon */}
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {renderStatCard(
            t.totalAnalyses,
            stats.totalAnalyses,
            <Calendar className="w-6 h-6" />,
            'border-blue-500'
          )}
          {renderStatCard(
            t.averageImprovement,
            `${stats.averageImprovement.toFixed(1)}%`,
            <TrendingUp className="w-6 h-6" />,
            'border-green-500'
          )}
          {renderStatCard(
            t.complianceRate,
            `${stats.complianceRate.toFixed(1)}%`,
            <CheckCircle className="w-6 h-6" />,
            'border-purple-500'
          )}
          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t.improvementTrend}</p>
                <p className="text-xl font-bold text-gray-900 capitalize">
                  {t[stats.improvementTrend as keyof typeof t]}
                </p>
              </div>
              {renderTrendIcon(stats.improvementTrend)}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            {t.filter}
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <Download className="w-5 h-5" />
              {t.export}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {(['json', 'csv', 'excel', 'pdf'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 capitalize"
                >
                  {t[`format${format.toUpperCase()}` as keyof typeof t]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dateRange}
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          start: new Date(e.target.value),
                          end: prev.dateRange?.end || new Date(),
                        },
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          start: prev.dateRange?.start || new Date(),
                          end: new Date(e.target.value),
                        },
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Clinician Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.clinician}
                </label>
                <input
                  type="text"
                  placeholder={t.clinician}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      clinician: e.target.value || undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.tags}
                </label>
                <input
                  type="text"
                  placeholder={t.tags}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      tags: e.target.value ? e.target.value.split(',') : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedRecords.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-blue-900">
            {selectedRecords.size} {t.itemsSelected}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const tags = prompt('Enter tags (comma-separated):');
                if (tags) {
                  AnalysisArchiveEngine.bulkAddTags(
                    Array.from(selectedRecords),
                    tags.split(',').map((t) => t.trim())
                  );
                  loadArchiveData();
                }
              }}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50"
            >
              <Tag className="w-4 h-4" />
              {t.addTags}
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
              {t.delete}
            </button>
          </div>
        </div>
      )}

      {/* Records */}
      {searchResults.records.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">{t.noRecords}</p>
        </div>
      ) : (
        <>
          <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            {searchResults.records.map((record) => renderRecordCard(record))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {t.page} {searchResults.page} {t.of} {Math.ceil(searchResults.total / pageSize)}
              ({searchResults.total} {t.items})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={searchResults.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                {language === 'th' ? 'ก่อนหน้า' : 'Previous'}
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      Math.ceil(searchResults.total / pageSize),
                      prev + 1
                    )
                  )
                }
                disabled={searchResults.page * pageSize >= searchResults.total}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                {language === 'th' ? 'ถัดไป' : 'Next'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArchiveManagement;
