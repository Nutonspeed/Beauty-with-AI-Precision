'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Video, PlayCircle, CheckCircle, Clock, Award, Users } from 'lucide-react'

interface TrainingModule {
  id: string
  title: string
  description: string
  type: 'guide' | 'video' | 'walkthrough'
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  completed: boolean
  progress: number
}

const TrainingDashboard: React.FC = () => {
  const [modules, setModules] = useState<TrainingModule[]>([
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of Beauty with AI Precision',
      type: 'guide',
      duration: 5,
      difficulty: 'beginner',
      completed: true,
      progress: 100
    },
    {
      id: 'patient-management',
      title: 'Patient Management',
      description: 'Master patient records and appointment scheduling',
      type: 'video',
      duration: 15,
      difficulty: 'intermediate',
      completed: false,
      progress: 60
    },
    {
      id: 'ai-analysis',
      title: 'AI Skin Analysis',
      description: 'Understanding and using AI-powered skin analysis',
      type: 'walkthrough',
      duration: 20,
      difficulty: 'advanced',
      completed: false,
      progress: 30
    },
    {
      id: 'ar-simulator',
      title: 'AR Treatment Simulator',
      description: '3D visualization and treatment planning',
      type: 'video',
      duration: 12,
      difficulty: 'intermediate',
      completed: false,
      progress: 0
    }
  ])

  const [activeTab, setActiveTab] = useState('overview')

  const completedModules = modules.filter(m => m.completed).length
  const totalModules = modules.length
  const overallProgress = (completedModules / totalModules) * 100

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return <BookOpen className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'walkthrough': return <PlayCircle className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const startModule = (moduleId: string) => {
    // Navigate to training module
    console.log('Starting module:', moduleId)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Center</h1>
          <p className="text-muted-foreground">
            Master Beauty with AI Precision with our comprehensive training program
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          View Certificates
        </Button>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedModules}/{totalModules} modules completed
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedModules}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {modules.filter(m => m.progress > 0 && !m.completed).length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {modules.filter(m => m.progress === 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Not Started</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="walkthroughs">Walkthroughs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {modules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(module.type)}
                        <h3 className="font-semibold">{module.title}</h3>
                        <Badge className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty}
                        </Badge>
                        {module.completed && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration} min
                        </div>
                        <div>Progress: {module.progress}%</div>
                      </div>
                      {module.progress > 0 && (
                        <Progress value={module.progress} className="h-1" />
                      )}
                    </div>
                    <Button
                      onClick={() => startModule(module.id)}
                      variant={module.completed ? "outline" : "default"}
                    >
                      {module.completed ? 'Review' : module.progress > 0 ? 'Continue' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="grid gap-4">
            {modules.filter(m => m.type === 'guide').map((module) => (
              <Card key={module.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <Button>Read Guide</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4">
            {modules.filter(m => m.type === 'video').map((module) => (
              <Card key={module.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <Button>Watch Video</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="walkthroughs" className="space-y-4">
          <div className="grid gap-4">
            {modules.filter(m => m.type === 'walkthrough').map((module) => (
              <Card key={module.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <Button>Start Walkthrough</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TrainingDashboard
