/**
 * Interactive Photo Markers
 * Displays clickable concern markers overlaid on skin analysis photo
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Layers, Info, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type {
  InteractiveConcern,
  ConcernLocation,
  ConcernType,
  MarkerInteraction,
} from '@/lib/concerns/concern-education';
import {
  formatConcernType,
  getSeverityColor,
} from '@/lib/concerns/concern-education';

interface InteractivePhotoMarkersProps {
  imageUrl: string;
  concerns: InteractiveConcern[];
  onConcernClick?: (concern: InteractiveConcern, location?: ConcernLocation) => void;
  onMarkerHover?: (concern: InteractiveConcern | null) => void;
  enableZoom?: boolean;
  enableLayerToggle?: boolean;
  className?: string;
  imageAlt?: string;
}

export function InteractivePhotoMarkers({
  imageUrl,
  concerns,
  onConcernClick,
  onMarkerHover,
  enableZoom = true,
  enableLayerToggle = true,
  className,
  imageAlt = 'Skin analysis photo',
}: InteractivePhotoMarkersProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredMarker, setHoveredMarker] = useState<{
    concern: InteractiveConcern;
    location: ConcernLocation;
  } | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<ConcernType>>(
    new Set(concerns.map(c => c.type))
  );
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image dimensions
  useEffect(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      setImageDimensions({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    }
  }, [imageUrl]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setPan({ x: 0, y: 0 }); // Reset pan when zooming out
    }
  }, [zoomLevel]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoomLevel, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Layer toggle
  const toggleLayer = useCallback((concernType: ConcernType) => {
    setVisibleLayers(prev => {
      const newLayers = new Set(prev);
      if (newLayers.has(concernType)) {
        newLayers.delete(concernType);
      } else {
        newLayers.add(concernType);
      }
      return newLayers;
    });
  }, []);

  const toggleAllLayers = useCallback(() => {
    if (visibleLayers.size === concerns.length) {
      setVisibleLayers(new Set());
    } else {
      setVisibleLayers(new Set(concerns.map(c => c.type)));
    }
  }, [concerns, visibleLayers.size]);

  // Marker interactions
  const handleMarkerClick = useCallback((
    concern: InteractiveConcern,
    location?: ConcernLocation
  ) => {
    onConcernClick?.(concern, location);
  }, [onConcernClick]);

  const handleMarkerHover = useCallback((
    concern: InteractiveConcern | null,
    location?: ConcernLocation
  ) => {
    if (concern && location) {
      setHoveredMarker({ concern, location });
    } else {
      setHoveredMarker(null);
    }
    onMarkerHover?.(concern);
  }, [onMarkerHover]);

  // Get marker position in pixels
  const getMarkerPosition = (location: ConcernLocation) => {
    if (!containerRef.current) return { left: 0, top: 0 };
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    return {
      left: location.x * rect.width,
      top: location.y * rect.height,
    };
  };

  // Render marker
  const renderMarker = (
    concern: InteractiveConcern,
    location: ConcernLocation,
    index: number
  ) => {
    if (!visibleLayers.has(concern.type)) return null;

    const position = getMarkerPosition(location);
    const color = concern.education?.color || getSeverityColor(location.severity || 'medium');
    const isHovered = hoveredMarker?.concern.type === concern.type && 
                      hoveredMarker?.location === location;

    return (
      <TooltipProvider key={`${concern.type}-${index}`}>
        <Tooltip open={isHovered}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2',
                'rounded-full border-2 border-white shadow-lg',
                'transition-all duration-200 cursor-pointer',
                'hover:scale-125 focus:scale-125 focus:outline-none',
                isHovered && 'scale-125 ring-4 ring-white/30'
              )}
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: location.radius ? `${location.radius * 2}px` : '20px',
                height: location.radius ? `${location.radius * 2}px` : '20px',
                backgroundColor: color,
                opacity: 0.8,
              }}
              onClick={() => handleMarkerClick(concern, location)}
              onMouseEnter={() => handleMarkerHover(concern, location)}
              onMouseLeave={() => handleMarkerHover(null)}
              aria-label={`${formatConcernType(concern.type)} marker`}
            >
              <span className="sr-only">{formatConcernType(concern.type)}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-white dark:bg-gray-800 border shadow-lg p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{concern.education?.icon || '📍'}</span>
              <div>
                <div className="font-semibold">{formatConcernType(concern.type)}</div>
                <div className="text-xs text-gray-500">
                  Confidence: {Math.round(location.confidence * 100)}%
                </div>
                {location.severity && (
                  <Badge
                    variant="secondary"
                    className="text-xs mt-1"
                    style={{ backgroundColor: getSeverityColor(location.severity) }}
                  >
                    {location.severity}
                  </Badge>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render concern summary markers (for concerns without specific locations)
  const renderSummaryMarkers = () => {
    const concernsWithoutLocations = concerns.filter(
      c => visibleLayers.has(c.type) && (!c.locations || c.locations.length === 0)
    );

    if (concernsWithoutLocations.length === 0) return null;

    return (
      <div className="absolute bottom-4 left-4 space-y-2">
        {concernsWithoutLocations.map((concern) => (
          <button
            key={concern.type}
            onClick={() => handleMarkerClick(concern)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
              'border shadow-md hover:shadow-lg transition-all',
              'hover:scale-105'
            )}
          >
            <span className="text-xl">{concern.education?.icon || '📍'}</span>
            <div className="text-left">
              <div className="text-sm font-semibold">{formatConcernType(concern.type)}</div>
              <div className="text-xs text-gray-500">
                Severity: {concern.averageSeverity.toFixed(1)}/10
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Zoom controls */}
        {enableZoom && (
          <div className="flex flex-col gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="h-8 w-8"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="h-8 w-8"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            {zoomLevel > 1 && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleResetZoom}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Layer toggle */}
        {enableLayerToggle && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleAllLayers}
              className="h-8 w-8 mb-1"
              title={visibleLayers.size > 0 ? 'Hide all layers' : 'Show all layers'}
            >
              {visibleLayers.size > 0 ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <div className="space-y-1">
              {concerns.map((concern) => (
                <Button
                  key={concern.type}
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleLayer(concern.type)}
                  className={cn(
                    'h-8 w-8',
                    !visibleLayers.has(concern.type) && 'opacity-40'
                  )}
                  style={{
                    color: visibleLayers.has(concern.type)
                      ? concern.education?.color
                      : undefined,
                  }}
                  title={formatConcernType(concern.type)}
                >
                  <span className="text-lg">{concern.education?.icon || '📍'}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">
            {concerns.filter(c => visibleLayers.has(c.type)).length} concerns detected
          </span>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800',
          zoomLevel > 1 && 'cursor-move'
        )}
        style={{
          aspectRatio: '3/4',
          maxHeight: '80vh',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Image */}
        <div
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
            transformOrigin: 'center',
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <Image
            ref={imageRef as any}
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-contain"
            onLoad={(e) => {
              const img = e.currentTarget;
              setImageDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            }}
          />

          {/* Markers */}
          {concerns.map((concern) =>
            concern.locations.map((location, index) =>
              renderMarker(concern, location, index)
            )
          )}
        </div>

        {/* Summary markers */}
        {renderSummaryMarkers()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {concerns.map((concern) => (
          <button
            key={concern.type}
            onClick={() => toggleLayer(concern.type)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
              'border transition-all hover:scale-105',
              visibleLayers.has(concern.type)
                ? 'bg-white dark:bg-gray-800 shadow'
                : 'bg-gray-100 dark:bg-gray-900 opacity-50'
            )}
          >
            <span className="text-lg">{concern.education?.icon || '📍'}</span>
            <span className="font-medium">{formatConcernType(concern.type)}</span>
            {concern.locations.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {concern.locations.length}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
