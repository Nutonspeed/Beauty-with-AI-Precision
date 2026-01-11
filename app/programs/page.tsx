"use client"

/**
 * Treatment Progress Demo Page
 * 
 * Complete demo showcasing treatment tracking, timeline, photos,
 * milestones, and progress notes.
 */

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Image,
  Milestone,
  Star,
  TrendingUp,
  User,
  Stethoscope,
} from "lucide-react"
import {
  useTreatments,
  useTreatment,
  useTreatmentSessions,
  useTreatmentMilestones,
  useTreatmentReport,
} from "@/hooks/useTreatment"
import TreatmentTimelineComponent from "@/components/treatment-timeline"
import PhotoComparison from "@/components/photo-comparison"
import ProgressNotes from "@/components/progress-notes"

export default function TreatmentsPage() {
  const { treatments } = useTreatments()
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(
    treatments[0]?.id || ""
  )

  const { treatment } = useTreatment(selectedTreatmentId)
  const { sessions } = useTreatmentSessions(selectedTreatmentId)
  const { milestones } = useTreatmentMilestones(selectedTreatmentId)
  const { report } = useTreatmentReport(selectedTreatmentId)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "planned":
        return "bg-gray-100 text-gray-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "missed":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "missed":
        return "bg-red-100 text-red-800"
      case "skipped":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (treatments.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No treatments found</h2>
              <p className="text-gray-500">Start tracking patient treatments to see them here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Treatment Progress Tracking
          </h1>
          <p className="text-gray-600 mt-1">Monitor patient treatment journeys and outcomes</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          New Treatment Plan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{treatments.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">
                {treatments.filter((t) => t.status === "in_progress").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">
                {treatments.reduce((sum, t) => sum + t.completedSessions, 0)} /{" "}
                {treatments.reduce((sum, t) => sum + t.totalSessions, 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">
                {treatments.length > 0
                  ? Math.round(
                      treatments.reduce(
                        (sum, t) => sum + (t.completedSessions / t.totalSessions) * 100,
                        0
                      ) / treatments.length
                    )
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Treatment Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Treatment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatments.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all ${
                    selectedTreatmentId === t.id
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedTreatmentId(t.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900">{t.treatmentName}</h3>
                        <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        {t.patientName}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {t.completedSessions}/{t.totalSessions} sessions
                          </span>
                        </div>
                        <Progress
                          value={(t.completedSessions / t.totalSessions) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {treatment && (
            <>
              {/* Treatment Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{treatment.treatmentName}</CardTitle>
                      <CardDescription>{treatment.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(treatment.status)}>{treatment.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Patient Information</h4>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {treatment.patientName}
                        </p>
                        <p className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          {treatment.doctorName}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(treatment.startDate)} - {formatDate(treatment.estimatedEndDate)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Progress Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sessions Completed</span>
                          <span className="font-medium">
                            {treatment.completedSessions}/{treatment.totalSessions}
                          </span>
                        </div>
                        <Progress
                          value={(treatment.completedSessions / treatment.totalSessions) * 100}
                          className="h-2"
                        />
                        {report && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Patient Rating</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-medium">{report.averageRating.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Cost</span>
                              <span className="font-medium">
                                {formatCurrency(treatment.actualCost)} / {formatCurrency(treatment.estimatedCost)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Treatment Goals</h4>
                      <ul className="space-y-1 text-sm">
                        {treatment.goals.map((goal, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Patient Concerns</h4>
                      <ul className="space-y-1 text-sm">
                        {treatment.concerns.map((concern, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              {report && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Milestones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Milestone className="w-5 h-5 text-purple-600" />
                          <span className="text-2xl font-bold">
                            {report.milestonesAchieved}/{report.totalMilestones}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">Achieved</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Photos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image className="w-5 h-5 text-blue-600" />
                          <span className="text-2xl font-bold">
                            {report.photoCount.before + report.photoCount.after + report.photoCount.progress}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">Total</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Duration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span className="text-2xl font-bold">{report.duration}</span>
                        </div>
                        <span className="text-sm text-gray-500">Days</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          {selectedTreatmentId && <TreatmentTimelineComponent treatmentId={selectedTreatmentId} />}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Session {session.sessionNumber}</CardTitle>
                      <CardDescription>{formatDate(session.scheduledDate)}</CardDescription>
                    </div>
                    <Badge className={getSessionStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Session Details</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Doctor:</span> {session.doctorName}
                        </p>
                        <p>
                          <span className="text-gray-600">Duration:</span> {session.duration} minutes
                        </p>
                        <p>
                          <span className="text-gray-600">Cost:</span> {formatCurrency(session.cost)}
                        </p>
                        {session.patientRating && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Rating:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < session.patientRating!
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Procedures</h4>
                      <ul className="space-y-1 text-sm">
                        {session.procedures.map((proc, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                            <span>{proc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {session.observations && (
                    <div className="pt-3 border-t">
                      <h4 className="font-medium text-gray-700 mb-2">Observations</h4>
                      <p className="text-sm text-gray-600">{session.observations}</p>
                    </div>
                  )}

                  {session.nextSteps && (
                    <div className="pt-3 border-t">
                      <h4 className="font-medium text-gray-700 mb-2">Next Steps</h4>
                      <p className="text-sm text-gray-600">{session.nextSteps}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No sessions scheduled yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos">
          {selectedTreatmentId && <PhotoComparison treatmentId={selectedTreatmentId} />}
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          {milestones.length > 0 ? (
            milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      <CardDescription>{milestone.description}</CardDescription>
                    </div>
                    <Badge className={getMilestoneStatusColor(milestone.status)}>
                      {milestone.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Timeline</h4>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Target: {formatDate(milestone.targetDate)}
                        </p>
                        {milestone.achievedDate && (
                          <p className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Achieved: {formatDate(milestone.achievedDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Criteria</h4>
                      <ul className="space-y-1 text-sm">
                        {milestone.criteria.map((criterion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span>{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {milestone.notes && (
                    <div className="pt-3 border-t">
                      <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{milestone.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No milestones defined yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          {selectedTreatmentId && <ProgressNotes treatmentId={selectedTreatmentId} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
