/**
 * Tax Receipt API Endpoints
 * Handles tax receipt creation, retrieval, and management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaxReceiptGenerator } from '@/lib/payment/tax-receipt-generator'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const clinicId = searchParams.get('clinic_id')
    const customerId = searchParams.get('customer_id')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Build query
    let query = supabase
      .from('tax_receipts')
      .select(`
        *,
        clinics!tax_receipts_clinic_id_fkey (
          name
        ),
        customers!tax_receipts_customer_id_fkey (
          full_name
        )
      `, { count: 'exact' })
      .order('issue_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    // Apply filters
    if (clinicId) query = query.eq('clinic_id', clinicId)
    if (customerId) query = query.eq('customer_id', customerId)
    if (status) query = query.eq('status', status)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching tax receipts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tax receipts' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      receipts: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Tax receipts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { type, ...params } = body
    
    switch (type) {
      case 'create_from_payment':
        return await createTaxReceiptFromPayment(params)
      
      case 'issue_receipt':
        return await issueTaxReceipt(params)
      
      case 'cancel_receipt':
        return await cancelTaxReceipt(params)
      
      case 'generate_pdf':
        return await generateTaxReceiptPDF(params)
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation type' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Tax receipts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createTaxReceiptFromPayment(params: {
  payment_id: string
  seller_tax_id?: string
  buyer_tax_id?: string
  branch_code?: string
  notes?: string
}) {
  const supabase = await createClient()
  
  // Call the database function
  const { data, error } = await supabase
    .rpc('create_tax_receipt_from_payment', {
      p_payment_id: params.payment_id,
      p_seller_tax_id: params.seller_tax_id || null,
      p_buyer_tax_id: params.buyer_tax_id || null,
      p_branch_code: params.branch_code || null,
      p_notes: params.notes || null
    })
  
  if (error) {
    console.error('Error creating tax receipt:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create tax receipt' },
      { status: 500 }
    )
  }
  
  // Get the created receipt
  const { data: receipt } = await supabase
    .from('tax_receipts')
    .select('*')
    .eq('id', data)
    .single()
  
  return NextResponse.json({
    success: true,
    receipt
  })
}

async function issueTaxReceipt(params: { receipt_id: string }) {
  try {
    await TaxReceiptGenerator.issueTaxReceipt(params.receipt_id)
    
    return NextResponse.json({
      success: true,
      message: 'Tax receipt issued successfully'
    })
  } catch (error) {
    console.error('Error issuing tax receipt:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to issue tax receipt' },
      { status: 500 }
    )
  }
}

async function cancelTaxReceipt(params: {
  receipt_id: string
  reason: string
}) {
  try {
    await TaxReceiptGenerator.cancelTaxReceipt(params.receipt_id, params.reason)
    
    return NextResponse.json({
      success: true,
      message: 'Tax receipt cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling tax receipt:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel tax receipt' },
      { status: 500 }
    )
  }
}

async function generateTaxReceiptPDF(params: { receipt_id: string }) {
  try {
    const filename = await TaxReceiptGenerator.saveTaxReceiptPDF(params.receipt_id)
    
    return NextResponse.json({
      success: true,
      filename
    })
  } catch (error) {
    console.error('Error generating tax receipt PDF:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
