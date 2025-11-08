'use client';

import { Suspense, useEffect, useState } from 'react';
import type { FC } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIErrorBoundary } from '@/components/error-boundary';
import { AIChatDemoPanel } from '@/components/demo/ai/chat-demo-panel';
import { AIRecommenderDemoPanel } from '@/components/demo/ai/recommender-demo-panel';
import { PipelineAnalysisLab } from '@/components/demo/ai/labs/pipeline-analysis-lab';
import { PipelineInitializationLab } from '@/components/demo/ai/labs/pipeline-initialization-lab';
import { PerformanceBenchmarkLab } from '@/components/demo/ai/labs/performance-benchmark-lab';
import { HuggingFaceIntegrationLab } from '@/components/demo/ai/labs/huggingface-integration-lab';
import { cn } from '@/lib/utils';
import { FlaskConical, GaugeCircle, MessageSquare, Sparkles, Workflow } from 'lucide-react';

type TabId = 'chat' | 'recommender' | 'labs';

interface TabDefinition {
  id: TabId;
  label: string;
  description: string;
  icon: typeof MessageSquare;
}

const TAB_DEFINITIONS: TabDefinition[] = [
  {
    id: 'chat',
    label: 'AI Chat Assistant',
    description: 'พูดคุยกับผู้ช่วย AI ภาษาไทยแบบเรียลไทม์ พร้อมคำแนะนำเฉพาะบุคคล',
    icon: MessageSquare,
  },
  {
    id: 'recommender',
    label: 'Treatment Recommender',
    description: 'ระบบแนะนำแผนการรักษาอัตโนมัติจากข้อมูลวิเคราะห์ผิวและโปรไฟล์ลูกค้า',
    icon: Sparkles,
  },
  {
    id: 'labs',
    label: 'AI Labs',
    description: 'รวมชุดทดสอบ AI ขั้นสูงสำหรับทีมวิจัยและพัฒนา',
    icon: FlaskConical,
  },
] as const satisfies TabDefinition[];

const DEFAULT_TAB: TabId = TAB_DEFINITIONS[0].id;

function isTabId(value: string | null): value is TabId {
  return value !== null && TAB_DEFINITIONS.some((tab) => tab.id === value);
}

type LabId =
  | 'pipeline-analysis'
  | 'pipeline-initialization'
  | 'performance-benchmark'
  | 'huggingface-integration';

interface LabDefinition {
  id: LabId;
  title: string;
  description: string;
  detail: string;
  icon: typeof MessageSquare;
  component: FC;
}

const LAB_DEFINITIONS = [
  {
    id: 'pipeline-analysis',
    title: 'AI Pipeline Lab',
    description: 'ทดสอบ MediaPipe + TensorFlow Pipeline',
    detail: 'โหลดโมเดลจริงและตรวจสอบการเชื่อมต่อ Pipeline สำหรับการวิเคราะห์ผิว',
    icon: Sparkles,
    component: PipelineAnalysisLab,
  },
  {
    id: 'performance-benchmark',
    title: 'Performance Benchmark',
    description: 'วัดประสิทธิภาพการตรวจจับ + Heatmap',
    detail: 'ประเมินความเร็วการตรวจจับ Concerns และการสร้าง Heatmap สำหรับทีมวิจัย',
    icon: GaugeCircle,
    component: PerformanceBenchmarkLab,
  },
  {
    id: 'huggingface-integration',
    title: 'HuggingFace Integration',
    description: 'ทดสอบโมเดลจาก HuggingFace ในเบราว์เซอร์',
    detail: 'ตรวจสอบการโหลด Token, การวิเคราะห์ภาพ และความถูกต้องของผลลัพธ์',
    icon: FlaskConical,
    component: HuggingFaceIntegrationLab,
  },
  {
    id: 'pipeline-initialization',
    title: 'AI Simulation (Legacy)',
    description: 'ตรวจสอบ Pipeline รุ่นเก่า',
    detail: 'เก็บไว้สำหรับเปรียบเทียบผลลัพธ์กับเวอร์ชันใหม่ก่อนตัดสินใจยกเลิก',
    icon: MessageSquare,
    component: PipelineInitializationLab,
  },
] as const satisfies readonly LabDefinition[];

const DEFAULT_LAB: LabId = LAB_DEFINITIONS[0].id;

function isLabId(value: string | null): value is LabId {
  return value !== null && LAB_DEFINITIONS.some((lab) => lab.id === value);
}

type TabsRootProps = Parameters<typeof Tabs>[0];
type TabsListRootProps = Parameters<typeof TabsList>[0];
type TabsTriggerRootProps = Parameters<typeof TabsTrigger>[0];
type TabsContentRootProps = Parameters<typeof TabsContent>[0];

const TabsRoot: FC<TabsRootProps> = (props) => <Tabs {...props} />;
const TabsListRoot: FC<TabsListRootProps> = (props) => <TabsList {...props} />;
const TabsTriggerRoot: FC<TabsTriggerRootProps> = (props) => <TabsTrigger {...props} />;
const TabsContentRoot: FC<TabsContentRootProps> = (props) => <TabsContent {...props} />;

function DemoAIPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const section = searchParams.get('section');
    return isTabId(section) ? section : DEFAULT_TAB;
  });
  const [activeLab, setActiveLab] = useState<LabId>(() => {
    const lab = searchParams.get('lab');
    return isLabId(lab) ? lab : DEFAULT_LAB;
  });

  useEffect(() => {
    const sectionParam = searchParams.get('section');
    const labParam = searchParams.get('lab');

    if (isTabId(sectionParam)) {
      if (sectionParam !== activeTab) {
        setActiveTab(sectionParam);
      }
    } else if (sectionParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('section', DEFAULT_TAB);
      params.delete('lab');
      router.replace(`?${params.toString()}`, { scroll: false });
      if (activeTab !== DEFAULT_TAB) {
        setActiveTab(DEFAULT_TAB);
      }
      return;
    } else if (activeTab !== DEFAULT_TAB) {
      setActiveTab(DEFAULT_TAB);
    }

    if (sectionParam === 'labs') {
      const nextLab = isLabId(labParam) ? labParam : DEFAULT_LAB;
      if (nextLab !== activeLab) {
        setActiveLab(nextLab);
      }

      if (!isLabId(labParam)) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('section', 'labs');
        params.set('lab', nextLab);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    } else if (labParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('lab');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeLab, activeTab, router, searchParams]);

  const handleTabChange = (value: string) => {
    if (!isTabId(value)) {
      return;
    }

    setActiveTab(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set('section', value);
    if (value === 'labs') {
      const labParam = searchParams.get('lab');
      const nextLab = isLabId(labParam) ? labParam : DEFAULT_LAB;
      setActiveLab(nextLab);
      params.set('lab', nextLab);
    } else {
      params.delete('lab');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleLabSelect = (labId: LabId) => {
    if (labId === activeLab) {
      return;
    }

    setActiveLab(labId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', 'labs');
    params.set('lab', labId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const activeLabDefinition =
    LAB_DEFINITIONS.find((lab) => lab.id === activeLab) ?? LAB_DEFINITIONS[0];
  const ActiveLabComponent = activeLabDefinition.component;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background pb-16">
      <header className="border-b bg-background/60 backdrop-blur">
        <div className="container mx-auto px-4 py-10">
          <Badge variant="outline" className="mb-4 flex w-fit items-center gap-2 bg-white/70 text-sm">
            <Workflow className="h-4 w-4" />
            AI Customer Experience Lab
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            AI Experience Playground
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            สำรวจฟีเจอร์ AI หลักที่พร้อมใช้งานในระบบ production และห้องทดลองที่เปิดให้ทีมวิศวกรทดลองโมเดลเวอร์ชันใหม่
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-10">
        <TabsRoot value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsListRoot className="grid w-full grid-cols-1 gap-2 md:grid-cols-3">
            {TAB_DEFINITIONS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTriggerRoot key={tab.id} value={tab.id} className="flex flex-col items-start gap-1 p-4 text-left">
                  <div className="flex items-center gap-2 text-base font-semibold">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                  <p className="text-xs text-muted-foreground">{tab.description}</p>
                </TabsTriggerRoot>
              );
            })}
          </TabsListRoot>

          <TabsContentRoot value="chat">
            <SectionHeader
              title="AI Chat Assistant"
              description="เดโมสนทนากับผู้ช่วย AI ภาษาไทย พร้อมองค์ความรู้ด้านการรักษาผิว"
            />
            <AIErrorBoundary fallback={<ErrorFallback label="AI Chat Assistant" />}>
              <AIChatDemoPanel />
            </AIErrorBoundary>
          </TabsContentRoot>

          <TabsContentRoot value="recommender">
            <SectionHeader
              title="AI Treatment Recommender"
              description="ระบบสร้างคำแนะนำการรักษาอัตโนมัติจากข้อมูลวิเคราะห์ผิวและงบประมาณ"
            />
            <AIErrorBoundary fallback={<ErrorFallback label="Treatment Recommender" />}>
              <AIRecommenderDemoPanel />
            </AIErrorBoundary>
          </TabsContentRoot>

          <TabsContentRoot value="labs">
            <SectionHeader
              title="AI Labs"
              description="พื้นที่ทดสอบโมดูล AI ขั้นสูงก่อนนำเข้า production"
            />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
              <div className="space-y-4">
                {LAB_DEFINITIONS.map((lab) => {
                  const Icon = lab.icon;
                  const isActive = lab.id === activeLabDefinition.id;
                  return (
                    <button
                      key={lab.id}
                      type="button"
                      onClick={() => handleLabSelect(lab.id)}
                      className={cn(
                        'group w-full text-left transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                        isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100',
                      )}
                    >
                      <Card
                        className={cn(
                          'h-full transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-primary/60',
                          isActive ? 'border-primary shadow-lg' : 'border-border/70 hover:shadow-md',
                        )}
                      >
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{lab.title}</CardTitle>
                            <CardDescription>{lab.description}</CardDescription>
                          </div>
                          <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{lab.detail}</p>
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>
              <div className="overflow-hidden rounded-lg border bg-background p-4 shadow-sm">
                <AIErrorBoundary fallback={<ErrorFallback label={activeLabDefinition.title} />}>
                  <ActiveLabComponent />
                </AIErrorBoundary>
              </div>
            </div>
          </TabsContentRoot>
        </TabsRoot>
      </main>
    </div>
  );
}

type SectionHeaderProps = Readonly<{
  title: string;
  description: string;
}>;

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8 space-y-2">
      <h2 className="text-3xl font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DemoAIPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <DemoAIPageContent />
    </Suspense>
  );
}

type ErrorFallbackProps = Readonly<{
  label: string;
}>;

function ErrorFallback({ label }: ErrorFallbackProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-700">ไม่สามารถโหลด {label} ได้</CardTitle>
        <CardDescription className="text-red-600">
          โปรดลองโหลดหน้าใหม่ หรือแจ้งทีมวิศวกรหากปัญหายังคงอยู่
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
