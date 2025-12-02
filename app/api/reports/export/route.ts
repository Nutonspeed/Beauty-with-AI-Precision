// Export Report API
import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { Parser } from 'json2csv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportData, format } = body

    if (!reportData || !format) {
      return NextResponse.json(
        { error: 'Report data and format are required' },
        { status: 400 }
      )
    }

    let fileBuffer: Buffer
    let contentType: string
    let filename: string

    switch (format) {
      case 'pdf':
        fileBuffer = await generatePDF(reportData)
        contentType = 'application/pdf'
        filename = `${reportData.metadata.title.replace(/\s+/g, '_')}.pdf`
        break

      case 'excel':
        fileBuffer = await generateExcel(reportData)
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = `${reportData.metadata.title.replace(/\s+/g, '_')}.xlsx`
        break

      case 'csv':
        fileBuffer = await generateCSV(reportData)
        contentType = 'text/csv'
        filename = `${reportData.metadata.title.replace(/\s+/g, '_')}.csv`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid export format' },
          { status: 400 }
        )
    }

    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Export failed:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}

async function generatePDF(reportData: any): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text(reportData.metadata.title, 20, 30)
  
  // Metadata
  doc.setFontSize(12)
  doc.text(`Generated: ${new Date(reportData.metadata.generatedAt).toLocaleString()}`, 20, 50)
  doc.text(`Date Range: ${new Date(reportData.metadata.dateRange.startDate).toLocaleDateString()} - ${new Date(reportData.metadata.dateRange.endDate).toLocaleDateString()}`, 20, 60)
  
  // Data section
  let yPosition = 80
  doc.setFontSize(14)
  doc.text('Report Data', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  Object.entries(reportData.data).forEach(([key, value]) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
    
    doc.text(`${key}: ${JSON.stringify(value)}`, 20, yPosition)
    yPosition += 10
  })
  
  // Insights
  if (reportData.insights && reportData.insights.length > 0) {
    yPosition += 10
    doc.setFontSize(14)
    doc.text('Insights', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    reportData.insights.forEach((insight: any) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.text(`• ${insight.title}: ${insight.description}`, 20, yPosition)
      yPosition += 10
    })
  }
  
  return Buffer.from(doc.output('arraybuffer'))
}

async function generateExcel(reportData: any): Promise<Buffer> {
  const workbook = XLSX.utils.book_new()
  
  // Metadata sheet
  const metadataData = [
    ['Title', reportData.metadata.title],
    ['Generated At', reportData.metadata.generatedAt],
    ['Start Date', reportData.metadata.dateRange.startDate],
    ['End Date', reportData.metadata.dateRange.endDate]
  ]
  
  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData)
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata')
  
  // Data sheet
  const dataSheet = XLSX.utils.json_to_sheet(flattenObject(reportData.data))
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Data')
  
  // Insights sheet
  if (reportData.insights && reportData.insights.length > 0) {
    const insightsSheet = XLSX.utils.json_to_sheet(reportData.insights)
    XLSX.utils.book_append_sheet(workbook, insightsSheet, 'Insights')
  }
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(excelBuffer)
}

async function generateCSV(reportData: any): Promise<Buffer> {
  const parser = new Parser()
  const csvData = parser.parse(flattenObject(reportData.data))
  return Buffer.from(csvData, 'utf-8')
}

function flattenObject(obj: any, prefix = ''): any[] {
  const result: any[] = []
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        result.push(...flattenObject(obj[key], newKey))
      } else {
        result.push({
          [newKey]: typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : obj[key]
        })
      }
    }
  }
  
  return result
}
