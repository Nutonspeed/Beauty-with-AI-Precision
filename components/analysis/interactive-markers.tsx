'use client';

/**
 * Interactive Photo Markers
 * Displays clickable concern markers overlaid on skin analysis photo
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Eye, EyeOff, Maximize2 } from 'lucide-react';
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
} from '@/lib/concerns/concern-education';
import {
  formatConcernType,
  getSeverityColor,
} from '@/lib/concerns/concern-education';
import { motion, AnimatePresence } from 'framer-motion';

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
  imageAlt,
}: InteractivePhotoMarkersProps) {
  const t = useTranslations('interactiveMarkers');
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
  const [_imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

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
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              whileHover={{ scale: 1.25, opacity: 1 }}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2',
                'rounded-full border-2 border-white shadow-lg',
                'transition-all duration-200 cursor-pointer',
                isHovered && 'scale-125 ring-4 ring-white/30 z-30'
              )}
              style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                width: location.radius ? `${location.radius * 2}px` : '24px',
                height: location.radius ? `${location.radius * 2}px` : '24px',
                backgroundColor: color,
              }}
              onClick={() => handleMarkerClick(concern, location)}
              onMouseEnter={() => handleMarkerHover(concern, location)}
              onMouseLeave={() => handleMarkerHover(null)}
              aria-label={`${formatConcernType(concern.type)} marker`}
            >
              <span className="sr-only">{formatConcernType(concern.type)}</span>
              {isHovered && (
                <div className="absolute inset-0 rounded-full animate-ping bg-white/20" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-white border-slate-100 rounded-2xl shadow-premium p-4 min-w-[180px] z-[100]"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-inner">
                {concern.education?.icon || '📍'}
              </div>
              <div className="space-y-1">
                <div className="font-black text-slate-950 italic uppercase tracking-tight leading-none">{formatConcernType(concern.type)}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                  {(t('confidence' as any) || 'Precision: {value}%').replace('{value}', String(Math.round(location.confidence * 100)))}
                </div>
                {location.severity && (
                  <Badge
                    className={cn(
                      "text-[8px] font-black italic border-none shadow-sm px-3 py-0.5 mt-1 rounded-full uppercase leading-none",
                      location.severity === 'low' ? 'bg-emerald-50 text-emerald-600' :
                      location.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    )}
                  >
                    {location.severity.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className={cn('relative w-full group/markers animate-in fade-in duration-700', className)}>
      {/* HUD interface interface */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-4">
        {/* Zoom interface interface */}
        {enableZoom && (
          <div className="flex flex-col gap-2 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-2 shadow-premium group/zoom">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="h-10 w-10 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-all shadow-inner"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <div className="h-px w-6 mx-auto bg-slate-100" />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="h-10 w-10 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-all shadow-inner"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <AnimatePresence>
              {zoomLevel > 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-2"
                >
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleResetZoom}
                    className="h-10 w-10 rounded-xl border-slate-200 bg-white text-slate-400 hover:text-pink-600 transition-all shadow-sm"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Layer toggle interface */}
        {enableLayerToggle && (
          <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-2 shadow-premium flex flex-col gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleAllLayers}
              className={cn(
                "h-10 w-10 rounded-xl transition-all shadow-inner",
                visibleLayers.size > 0 ? "text-pink-600 bg-pink-50" : "text-slate-300"
              )}
              title={visibleLayers.size > 0 ? t('hideAllLayers' as any) : t('showAllLayers' as any)}
            >
              {visibleLayers.size > 0 ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </Button>
            <div className="h-px w-6 mx-auto bg-slate-100" />
            <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide py-1">
              {concerns.map((concern) => (
                <Button
                  key={concern.type}
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleLayer(concern.type)}
                  className={cn(
                    'h-10 w-10 rounded-xl transition-all duration-500 shadow-sm relative overflow-hidden',
                    !visibleLayers.has(concern.type) ? 'opacity-30 grayscale' : 'bg-white hover:bg-slate-50'
                  )}
                  title={formatConcernType(concern.type)}
                >
                  <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xl relative z-10">{concern.education?.icon || '📍'}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Analytics interface Overlay interface */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 pointer-events-none">
        <div className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/50 shadow-premium">
          <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse shadow-glow-pink" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 italic">
            {(t('concernsDetected' as any) || '{count} Delta Nodes Active').replace('{count}', String(concerns.filter(c => visibleLayers.has(c.type)).length))}
          </span>
        </div>
        <AnimatePresence>
          {zoomLevel > 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-2xl text-white"
            >
              <Maximize2 className="h-4 w-4 text-pink-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] italic leading-none">Magnification: {zoomLevel.toFixed(1)}X</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Core Imaging Node interface */}
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden rounded-[3.5rem] border-4 border-white bg-slate-50 shadow-premium transition-all duration-700',
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
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none z-10" />
        
        {/* Imaging Asset interface */}
        <div
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
            transformOrigin: 'center',
            transition: isPanning ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)',
          }}
          className="relative w-full h-full"
        >
          <Image
            ref={imageRef as any}
            src={imageUrl}
            alt={imageAlt || t('imageAlt' as any) || "Dermal node capture"}
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

          {/* Neural Marker interface */}
          <div className="absolute inset-0 z-20">
            {concerns.map((concern) =>
              concern.locations.map((location, index) =>
                renderMarker(concern, location, index)
              )
            )}
          </div>
        </div>

        {/* Summary Overlay interface (for concerns without specific locations) */}
        <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-4">
          <AnimatePresence>
            {concerns.filter(c => visibleLayers.has(c.type) && (!c.locations || c.locations.length === 0)).map((concern, idx) => (
              <motion.button
                key={concern.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleMarkerClick(concern)}
                className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-white shadow-premium group/sum hover:scale-105 transition-all duration-500"
              >
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shadow-inner group-hover/sum:bg-pink-50 transition-colors">
                  {concern.education?.icon || '📍'}
                </div>
                <div className="text-left space-y-1 pr-4">
                  <div className="text-xl font-black text-slate-950 italic uppercase tracking-tighter group-hover/sum:text-pink-600 transition-colors leading-none">{formatConcernType(concern.type)}</div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{(t('severity' as any) || 'DELTA_IDX')}: {concern.averageSeverity.toFixed(1)}th</p>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend interface interface */}
      <div className="mt-8 flex flex-wrap gap-4 px-4">
        {concerns.map((concern, idx) => (
          <motion.button
            key={concern.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => toggleLayer(concern.type)}
            className={cn(
              'flex items-center gap-4 px-6 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest border transition-all duration-500 shadow-sm',
              visibleLayers.has(concern.type)
                ? 'bg-white border-slate-200 text-slate-950 hover:border-pink-500/20'
                : 'bg-slate-50 border-transparent text-slate-300 opacity-40 hover:opacity-100 grayscale'
            )}
          >
            <span className="text-xl">{concern.education?.icon || '📍'}</span>
            <span className="group-hover:text-pink-600 transition-colors">{formatConcernType(concern.type)}</span>
            {concern.locations.length > 0 && (
              <Badge className="bg-slate-950 text-white border-none rounded-full px-2 h-5 text-[8px] font-black leading-none flex items-center justify-center">
                {concern.locations.length}
              </Badge>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
