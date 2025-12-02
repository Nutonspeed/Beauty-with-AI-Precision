'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
    tension?: number
  }[]
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea'
  title: string
  data: ChartData
  options?: any
  height?: number
  className?: string
}

const defaultColors = [
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
]

const generateColors = (count: number) => {
  return Array.from({ length: count }, (_, i) => defaultColors[i % defaultColors.length])
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
}

export function Chart({ type, title, data, options = {}, height = 300, className = '' }: ChartConfig) {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      }
    }
  }

  // Ensure data has colors
  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || generateColors(dataset.data.length),
      borderColor: dataset.borderColor || generateColors(dataset.data.length)
    }))
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />
      case 'radar':
        return <Radar data={chartData} options={chartOptions} />
      case 'polarArea':
        return <PolarArea data={chartData} options={chartOptions} />
      default:
        return <Line data={chartData} options={chartOptions} />
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div style={{ height }}>
        {renderChart()}
      </div>
    </div>
  )
}

// Chart utility functions
export const createLineChartData = (labels: string[], datasets: any[]): ChartData => ({
  labels,
  datasets: datasets.map(dataset => ({
    ...dataset,
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6
  }))
})

export const createBarChartData = (labels: string[], datasets: any[]): ChartData => ({
  labels,
  datasets: datasets.map(dataset => ({
    ...dataset,
    borderWidth: 0,
    borderRadius: 4
  }))
})

export const createPieChartData = (labels: string[], data: number[]): ChartData => ({
  labels,
  datasets: [{
    label: 'Data',
    data,
    borderWidth: 2,
    borderColor: '#ffffff'
  }]
})

export const formatCurrency = (value: number) => `฿${value.toLocaleString('th-TH')}`

export const formatPercentage = (value: number) => `${value.toFixed(1)}%`

export default Chart
