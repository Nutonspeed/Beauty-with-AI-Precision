"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function BeautyLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Beauty with AI Precision
        </h1>
        <p className="text-xl mb-8 text-gray-300">
          Advanced AI-powered aesthetic clinic platform
        </p>
        <div className="space-y-4">
          <Link href="/th/analysis">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Try AI Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="text-sm text-gray-400">
            <Link href="/th" className="hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}