"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  TrendingUp, 
  Eye,
  Droplets,
  Sun,
  Wind
} from 'lucide-react';

interface ProblemArea {
  region: string;
  severity: number; // 0-10
  coordinates: { x: number; y: number; radius: number }; // Normalized 0-1
  concernType: 'wrinkles' | 'pigmentation' | 'acne' | 'dryness' | 'oiliness' | 'redness';
}

interface HeatmapData {
  problemAreas: ProblemArea[];
  overallSeverity: number;
}

interface SkinHeatmapProps {
  faceImage: string;
  heatmapData: HeatmapData;
  faceLandmarks?: any; // MediaPipe face landmarks
}

export default function SkinHeatmap({ faceImage, heatmapData, faceLandmarks }: SkinHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'wrinkles' | 'pigmentation' | 'acne' | 'dryness' | 'oiliness' | 'redness'>('all');
  const [hoveredArea, setHoveredArea] = useState<ProblemArea | null>(null);

  useEffect(() => {
    renderHeatmap();
  }, [faceImage, heatmapData, selectedView]);

  const renderHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw base image
      ctx.drawImage(img, 0, 0);
      
      // Filter problem areas by selected view
      const filteredAreas = selectedView === 'all' 
        ? heatmapData.problemAreas 
        : heatmapData.problemAreas.filter(area => area.concernType === selectedView);
      
      // Draw heatmap overlay
      filteredAreas.forEach(area => {
        const x = area.coordinates.x * canvas.width;
        const y = area.coordinates.y * canvas.height;
        const radius = area.coordinates.radius * Math.min(canvas.width, canvas.height);
        
        // Create radial gradient for heatmap effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // Color based on severity and concern type
        const color = getHeatmapColor(area.concernType, area.severity);
        const alpha = Math.min(0.7, area.severity / 15);
        
        gradient.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${color}${Math.round(alpha * 0.5 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${color}00`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        
        // Draw area marker
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw severity number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(area.severity.toString(), x, y);
      });
      
      // Draw face mesh overlay if landmarks provided
      if (faceLandmarks && faceLandmarks.length > 0) {
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        faceLandmarks.forEach((landmark: any, idx: number) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;
          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
    };
    
    img.src = faceImage;
  };

  const getHeatmapColor = (type: string, severity: number): string => {
    const colors: Record<string, string> = {
      wrinkles: '#9333EA', // Purple
      pigmentation: '#D97706', // Amber
      acne: '#DC2626', // Red
      dryness: '#0891B2', // Cyan
      oiliness: '#65A30D', // Lime
      redness: '#F43F5E', // Rose
    };
    return colors[type] || '#6B7280';
  };

  const getConcernIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      wrinkles: <TrendingUp className="w-4 h-4" />,
      pigmentation: <Sun className="w-4 h-4" />,
      acne: <AlertCircle className="w-4 h-4" />,
      dryness: <Droplets className="w-4 h-4" />,
      oiliness: <Wind className="w-4 h-4" />,
      redness: <AlertCircle className="w-4 h-4" />,
    };
    return icons[type] || <Eye className="w-4 h-4" />;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Find clicked area
    const clickedArea = heatmapData.problemAreas.find(area => {
      const dx = x - area.coordinates.x;
      const dy = y - area.coordinates.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= area.coordinates.radius;
    });

    setHoveredArea(clickedArea || null);
  };

  // Group areas by concern type
  const areasByConcern = heatmapData.problemAreas.reduce((acc, area) => {
    if (!acc[area.concernType]) acc[area.concernType] = [];
    acc[area.concernType].push(area);
    return acc;
  }, {} as Record<string, ProblemArea[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Advanced Skin Analysis Heatmap
        </CardTitle>
        <CardDescription>
          Interactive visualization of skin problem areas with severity levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <Tabs value={selectedView} onValueChange={(v: any) => setSelectedView(v)}>
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="wrinkles">Wrinkles</TabsTrigger>
            <TabsTrigger value="pigmentation">Pigment</TabsTrigger>
            <TabsTrigger value="acne">Acne</TabsTrigger>
            <TabsTrigger value="dryness">Dry</TabsTrigger>
            <TabsTrigger value="oiliness">Oily</TabsTrigger>
            <TabsTrigger value="redness">Red</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Heatmap Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-lg border shadow-sm cursor-crosshair"
            onClick={handleCanvasClick}
          />
          
          {/* Hover Info */}
          {hoveredArea && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg border max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                {getConcernIcon(hoveredArea.concernType)}
                <h4 className="font-semibold capitalize">{hoveredArea.concernType}</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region:</span>
                  <span className="font-medium">{hoveredArea.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity:</span>
                  <Badge variant={hoveredArea.severity >= 7 ? 'destructive' : hoveredArea.severity >= 4 ? 'secondary' : 'default'}>
                    {hoveredArea.severity}/10
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#9333EA' }}></div>
            <span>Wrinkles</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D97706' }}></div>
            <span>Pigmentation</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
            <span>Acne</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0891B2' }}></div>
            <span>Dryness</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#65A30D' }}></div>
            <span>Oiliness</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F43F5E' }}></div>
            <span>Redness</span>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Overall Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {heatmapData.overallSeverity.toFixed(1)}/10
              </div>
              <div className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  style={{ width: `${heatmapData.overallSeverity * 10}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Problem Areas Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{heatmapData.problemAreas.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {Object.keys(areasByConcern).length} different concern types
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Concern Breakdown:</h4>
          <div className="space-y-2">
            {Object.entries(areasByConcern).map(([type, areas]) => {
              const avgSeverity = areas.reduce((sum, a) => sum + a.severity, 0) / areas.length;
              return (
                <div key={type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getConcernIcon(type)}
                    <div>
                      <div className="font-medium text-sm capitalize">{type}</div>
                      <div className="text-xs text-muted-foreground">
                        {areas.length} area{areas.length > 1 ? 's' : ''} detected
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{avgSeverity.toFixed(1)}/10</div>
                    <div className="text-xs text-muted-foreground">Avg severity</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Scale Guide */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-semibold text-sm">Severity Scale:</h4>
          <div className="grid gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="default">1-3</Badge>
              <span>Mild - Minimal intervention needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">4-6</Badge>
              <span>Moderate - Recommended treatment</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">7-10</Badge>
              <span>Severe - Immediate attention recommended</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
