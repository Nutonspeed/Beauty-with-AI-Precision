"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Syringe, Droplet, Zap, Sparkles, Grid3x3, Scissors } from "lucide-react"

interface ProgramSelectorProps {
  selectedProgram: string
  onSelectProgram: (program: string) => void
}

const programs = [
  {
    id: "botox",
    name: "Botox",
    icon: Syringe,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "filler",
    name: "Dermal Filler",
    icon: Droplet,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    id: "laser",
    name: "Laser Program",
    icon: Zap,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  {
    id: "peel",
    name: "Chemical Peel",
    icon: Sparkles,
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  {
    id: "microneedling",
    name: "Microneedling",
    icon: Grid3x3,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  {
    id: "thread",
    name: "Thread Lift",
    icon: Scissors,
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
  },
]

import { useTranslations } from "next-intl"

export function ProgramSelector({ selectedProgram, onSelectProgram }: ProgramSelectorProps) {
  const t = useTranslations('booking.programs')
  const commonT = useTranslations('common')

  const localizedPrograms = programs.map(p => ({
    ...p,
    name: t(`${p.id}.name`)
  }))

  return (
    <div className="space-y-2">
      {localizedPrograms.map((program) => {
        const Icon = program.icon
        const isSelected = selectedProgram === program.id

        return (
          <Card
            key={program.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? `border-2 ${program.borderColor} ${program.bgColor}` : "border"
            }`}
            onClick={() => onSelectProgram(program.id)}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${program.bgColor}`}>
                <Icon className={`h-5 w-5 ${program.color}`} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{program.name}</div>
              </div>
              {isSelected && (
                <Badge className={`${program.bgColor} ${program.color} border-0`} variant="secondary">
                  {commonT('selected')}
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
