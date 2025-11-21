/**
 * Treatment Photo Gallery Component
 * Display treatment journey photos in a responsive gallery with timeline
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Image as ImageIcon,
  ZoomIn,
  Download,
  Calendar,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface GalleryPhoto {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  date: string;
  sessionNumber: number;
  milestoneType?: 'baseline' | 'progress' | 'final' | 'follow_up';
  notes?: string;
  metrics?: {
    overall_score: number;
    [key: string]: number;
  };
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  locale?: 'en' | 'th';
}

const TRANSLATIONS = {
  en: {
    title: 'Photo Gallery',
    description: 'Your treatment journey in photos',
    viewMode: {
      grid: 'Grid View',
      list: 'List View'
    },
    session: 'Session',
    date: 'Date',
    score: 'Score',
    download: 'Download',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    of: 'of',
    noPhotos: 'No photos available',
    milestone: {
      baseline: 'Baseline',
      progress: 'Progress',
      final: 'Final Result',
      follow_up: 'Follow-up'
    },
    downloadAll: 'Download All',
    viewFullSize: 'View Full Size'
  },
  th: {
    title: 'แกลเลอรี่รูปภาพ',
    description: 'เส้นทางการรักษาของคุณในรูปภาพ',
    viewMode: {
      grid: 'มุมมองตาราง',
      list: 'มุมมองรายการ'
    },
    session: 'เซสชัน',
    date: 'วันที่',
    score: 'คะแนน',
    download: 'ดาวน์โหลด',
    close: 'ปิด',
    previous: 'ก่อนหน้า',
    next: 'ถัดไป',
    of: 'จาก',
    noPhotos: 'ไม่มีรูปภาพ',
    milestone: {
      baseline: 'ฐาน',
      progress: 'ความคืบหน้า',
      final: 'ผลลัพธ์สุดท้าย',
      follow_up: 'ติดตามผล'
    },
    downloadAll: 'ดาวน์โหลดทั้งหมด',
    viewFullSize: 'ดูขนาดเต็ม'
  }
};

export function PhotoGallery({ photos, locale = 'en' }: PhotoGalleryProps) {
  const t = TRANSLATIONS[locale];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t.noPhotos}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePhotoClick = (photo: GalleryPhoto, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const handleDownload = (imageUrl: string, sessionNumber: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `session-${sessionNumber}-${Date.now()}.jpg`;
    link.click();
  };

  const handleDownloadAll = async () => {
    // Download all photos sequentially
    for (let i = 0; i < photos.length; i++) {
      setTimeout(() => {
        handleDownload(photos[i].imageUrl, photos[i].sessionNumber);
      }, i * 500); // Delay to avoid browser blocking
    }
  };

  const getMilestoneColor = (milestone?: string) => {
    switch (milestone) {
      case 'baseline':
        return 'bg-blue-500';
      case 'progress':
        return 'bg-yellow-500';
      case 'final':
        return 'bg-green-500';
      case 'follow_up':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                <Download className="w-4 h-4 mr-2" />
                {t.downloadAll}
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === 'grid' ? (
            <GridView
              photos={photos}
              locale={locale}
              onPhotoClick={handlePhotoClick}
              onDownload={handleDownload}
              getMilestoneColor={getMilestoneColor}
            />
          ) : (
            <ListView
              photos={photos}
              locale={locale}
              onPhotoClick={handlePhotoClick}
              onDownload={handleDownload}
              getMilestoneColor={getMilestoneColor}
            />
          )}
        </CardContent>
      </Card>

      {/* Full-size photo modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {t.session} {selectedPhoto?.sessionNumber}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({currentIndex + 1} {t.of} {photos.length})
                </span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedPhoto && handleDownload(selectedPhoto.imageUrl, selectedPhoto.sessionNumber)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              {/* Image */}
              <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <Image
                  src={selectedPhoto.imageUrl}
                  alt={`${t.session} ${selectedPhoto.sessionNumber}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={photos.length === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {t.previous}
                </Button>

                {/* Info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {selectedPhoto.milestoneType && (
                      <Badge className={getMilestoneColor(selectedPhoto.milestoneType)}>
                        {t.milestone[selectedPhoto.milestoneType]}
                      </Badge>
                    )}
                    {selectedPhoto.metrics && (
                      <Badge variant="outline">
                        {t.score}: {selectedPhoto.metrics.overall_score.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPhoto.date).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {selectedPhoto.notes && (
                    <p className="text-sm mt-2">{selectedPhoto.notes}</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={photos.length === 1}
                >
                  {t.next}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Grid View Component
interface ViewProps {
  photos: GalleryPhoto[];
  locale: 'en' | 'th';
  onPhotoClick: (photo: GalleryPhoto, index: number) => void;
  onDownload: (imageUrl: string, sessionNumber: number) => void;
  getMilestoneColor: (milestone?: string) => string;
}

function GridView({ photos, locale, onPhotoClick, onDownload, getMilestoneColor }: ViewProps) {
  const t = TRANSLATIONS[locale];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="group relative aspect-[3/4] bg-secondary rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onPhotoClick(photo, index)}
        >
          <Image
            src={photo.thumbnailUrl || photo.imageUrl}
            alt={`${t.session} ${photo.sessionNumber}`}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">
                  {t.session} {photo.sessionNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(photo.imageUrl, photo.sessionNumber);
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs opacity-90">
                {new Date(photo.date).toLocaleDateString(locale, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Milestone badge */}
          {photo.milestoneType && (
            <div className="absolute top-2 right-2">
              <Badge className={`${getMilestoneColor(photo.milestoneType)} text-white text-xs`}>
                {t.milestone[photo.milestoneType]}
              </Badge>
            </div>
          )}

          {/* Zoom icon */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 rounded-full p-2">
              <ZoomIn className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// List View Component
function ListView({ photos, locale, onPhotoClick, onDownload, getMilestoneColor }: ViewProps) {
  const t = TRANSLATIONS[locale];

  return (
    <div className="space-y-4">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          className="flex gap-4 p-4 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer transition-colors"
          onClick={() => onPhotoClick(photo, index)}
        >
          {/* Thumbnail */}
          <div className="relative w-32 h-32 flex-shrink-0 bg-background rounded-lg overflow-hidden">
            <Image
              src={photo.thumbnailUrl || photo.imageUrl}
              alt={`${t.session} ${photo.sessionNumber}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {t.session} {photo.sessionNumber}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(photo.date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {photo.milestoneType && (
                  <Badge className={getMilestoneColor(photo.milestoneType)}>
                    {t.milestone[photo.milestoneType]}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(photo.imageUrl, photo.sessionNumber);
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {photo.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                <div className="p-2 bg-background rounded">
                  <p className="text-xs text-muted-foreground">{t.score}</p>
                  <p className="text-lg font-bold">{photo.metrics.overall_score.toFixed(1)}</p>
                </div>
              </div>
            )}

            {photo.notes && (
              <p className="text-sm mt-2 text-muted-foreground">{photo.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
