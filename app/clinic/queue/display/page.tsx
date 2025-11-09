'use client'

/**
 * Queue Display Screen - TV/Monitor Mode
 * 
 * Large display for showing queue status in clinic waiting area
 * Features:
 * - Fullscreen mode
 * - Auto-refresh every 5 seconds
 * - Large, readable fonts
 * - Current serving + Next 3
 * - Animated transitions
 * - Clinic branding
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface QueueEntry {
  id: string
  queueNumber: string
  patientName: string
  status: 'waiting' | 'called' | 'serving' | 'completed'
  room?: string
  doctor?: string
  estimatedWait?: number
  checkInTime: Date
}

export default function QueueDisplayPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentServing, setCurrentServing] = useState<QueueEntry | null>(null)
  const [nextInQueue, setNextInQueue] = useState<QueueEntry[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch queue data every 5 seconds
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/clinic/queue/display')
        // const data = await response.json()
        
        // Mock data for now
        setCurrentServing({
          id: '1',
          queueNumber: 'A-015',
          patientName: 'คุณสมชาย',
          status: 'serving',
          room: 'ห้อง 2',
          doctor: 'นพ.สมศักดิ์',
          checkInTime: new Date()
        })

        setNextInQueue([
          {
            id: '2',
            queueNumber: 'A-016',
            patientName: 'คุณสมหญิง',
            status: 'called',
            estimatedWait: 10,
            checkInTime: new Date()
          },
          {
            id: '3',
            queueNumber: 'A-017',
            patientName: 'คุณประชา',
            status: 'waiting',
            estimatedWait: 25,
            checkInTime: new Date()
          },
          {
            id: '4',
            queueNumber: 'A-018',
            patientName: 'คุณสุวรรณี',
            status: 'waiting',
            estimatedWait: 40,
            checkInTime: new Date()
          }
        ])
      } catch (error) {
        console.error('Failed to fetch queue:', error)
      }
    }

    fetchQueue()
    const interval = setInterval(fetchQueue, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Fullscreen toggle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b-4 border-blue-600 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Clinic Logo & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">AI</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AI Beauty Clinic
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  ระบบคิวอัจฉริยะ
                </p>
              </div>
            </div>

            {/* Clock & Date */}
            <div className="text-right">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-xl text-gray-600 dark:text-gray-300 mt-1">
                {format(currentTime, 'EEEE, d MMMM yyyy', { locale: th })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Current Serving - Large Display */}
        <AnimatePresence mode="wait">
          {currentServing && (
            <motion.div
              key={currentServing.queueNumber}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-8 border-4 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 shadow-2xl">
                <div className="p-12 text-center">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <Bell className="w-12 h-12 text-green-600 animate-pulse" />
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                      กำลังให้บริการ
                    </h2>
                  </div>

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="my-8"
                  >
                    <div className="text-9xl font-black text-green-600 dark:text-green-400 mb-4">
                      {currentServing.queueNumber}
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg">
                      <div className="text-2xl text-gray-600 dark:text-gray-300 mb-2">
                        ห้องตรวจ
                      </div>
                      <div className="text-4xl font-bold text-blue-600">
                        {currentServing.room}
                      </div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg">
                      <div className="text-2xl text-gray-600 dark:text-gray-300 mb-2">
                        แพทย์
                      </div>
                      <div className="text-4xl font-bold text-purple-600">
                        {currentServing.doctor}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next in Queue */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-10 h-10 text-blue-600" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              คิวถัดไป
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {nextInQueue.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`
                  border-2 shadow-lg
                  ${index === 0 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-300 bg-white dark:bg-gray-800'}
                `}>
                  <div className="p-6 text-center">
                    <Badge 
                      variant={index === 0 ? "default" : "secondary"}
                      className="mb-4 text-lg px-4 py-2"
                    >
                      {index === 0 ? 'เตรียมพร้อม' : `คิวที่ ${index + 2}`}
                    </Badge>

                    <div className="text-6xl font-black text-gray-900 dark:text-white mb-3">
                      {entry.queueNumber}
                    </div>

                    {entry.estimatedWait && (
                      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                        <Clock className="w-5 h-5" />
                        <span className="text-xl">
                          รอประมาณ {entry.estimatedWait} นาที
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Announcements / Promotions */}
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-3 text-2xl font-semibold text-purple-800 dark:text-purple-300">
              <span className="text-3xl">📢</span>
              <span>โปรโมชั่นเดือนนี้: Botox ลด 20% | Filler ซื้อ 2 แถม 1</span>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer - Fullscreen Button (hidden in fullscreen) */}
      {!isFullscreen && (
        <footer className="fixed bottom-4 right-4">
          <button
            onClick={toggleFullscreen}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-all"
          >
            🖥️ โหมดเต็มจอ (F11)
          </button>
        </footer>
      )}
    </div>
  )
}
