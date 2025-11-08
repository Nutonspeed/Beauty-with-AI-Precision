/**
 * CRM Webhook Integration Utilities
 * Supports sending lead data to external CRM systems (Salesforce, HubSpot, Pipedrive, etc.)
 */

export interface WebhookConfig {
  url: string
  method?: 'POST' | 'PUT'
  headers?: Record<string, string>
  auth?: {
    type: 'bearer' | 'basic' | 'api_key'
    token?: string
    username?: string
    password?: string
    api_key_header?: string
    api_key_value?: string
  }
  retry?: {
    max_attempts?: number
    backoff_ms?: number
  }
}

export interface WebhookPayload {
  lead: {
    id: string
    full_name: string
    phone?: string
    email?: string
    line_id?: string
    status: string
    source?: string
    lead_score: number
    interested_treatments?: string[]
    budget_range?: string
    notes?: string
    created_at: string
    updated_at: string
  }
  clinic: {
    id: string
    name: string
    contact_phone?: string
    contact_email?: string
  }
  sales_staff: {
    id: string
    full_name: string
    email: string
  }
  analysis?: {
    id: string
    overall_score: number
    created_at: string
  }
  event_type: 'lead_created' | 'lead_updated' | 'lead_converted' | 'lead_lost'
  timestamp: string
}

export interface WebhookResponse {
  success: boolean
  status_code?: number
  response?: any
  error?: string
  attempts?: number
}

/**
 * Send webhook to external CRM system
 */
export async function sendCRMWebhook(
  payload: WebhookPayload,
  config: WebhookConfig
): Promise<WebhookResponse> {
  const maxAttempts = config.retry?.max_attempts || 3
  const backoffMs = config.retry?.backoff_ms || 1000

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers,
      }

      // Add authentication
      if (config.auth) {
        switch (config.auth.type) {
          case 'bearer':
            headers['Authorization'] = `Bearer ${config.auth.token}`
            break
          case 'basic':
            const credentials = Buffer.from(
              `${config.auth.username}:${config.auth.password}`
            ).toString('base64')
            headers['Authorization'] = `Basic ${credentials}`
            break
          case 'api_key':
            if (config.auth.api_key_header && config.auth.api_key_value) {
              headers[config.auth.api_key_header] = config.auth.api_key_value
            }
            break
        }
      }

      // Send request
      const response = await fetch(config.url, {
        method: config.method || 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      // Check response
      if (response.ok) {
        const responseData = await response.json().catch(() => null)
        
        return {
          success: true,
          status_code: response.status,
          response: responseData,
          attempts: attempt,
        }
      }

      // Non-2xx response
      const errorText = await response.text().catch(() => 'Unknown error')
      lastError = new Error(`HTTP ${response.status}: ${errorText}`)

      console.error(
        `[CRMWebhook] Attempt ${attempt}/${maxAttempts} failed:`,
        lastError.message
      )

      // Don't retry 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        break
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxAttempts) {
        await sleep(backoffMs * Math.pow(2, attempt - 1))
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      console.error(
        `[CRMWebhook] Attempt ${attempt}/${maxAttempts} failed:`,
        lastError.message
      )

      // Wait before retry
      if (attempt < maxAttempts) {
        await sleep(backoffMs * Math.pow(2, attempt - 1))
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    attempts: maxAttempts,
  }
}

/**
 * Transform lead data to Salesforce format
 */
export function transformToSalesforce(payload: WebhookPayload) {
  return {
    FirstName: payload.lead.full_name.split(' ')[0],
    LastName: payload.lead.full_name.split(' ').slice(1).join(' ') || '-',
    Email: payload.lead.email || null,
    Phone: payload.lead.phone || null,
    Company: payload.clinic.name,
    Status: mapStatusToSalesforce(payload.lead.status),
    LeadSource: payload.lead.source || 'Other',
    Rating: mapScoreToRating(payload.lead.lead_score),
    Description: payload.lead.notes || '',
    // Custom fields
    Budget__c: payload.lead.budget_range,
    Interested_Treatments__c: payload.lead.interested_treatments?.join('; '),
    Lead_Score__c: payload.lead.lead_score,
    Line_ID__c: payload.lead.line_id,
    External_ID__c: payload.lead.id,
  }
}

/**
 * Transform lead data to HubSpot format
 */
export function transformToHubSpot(payload: WebhookPayload) {
  return {
    properties: {
      email: payload.lead.email || '',
      firstname: payload.lead.full_name.split(' ')[0],
      lastname: payload.lead.full_name.split(' ').slice(1).join(' ') || '-',
      phone: payload.lead.phone || '',
      company: payload.clinic.name,
      lifecyclestage: mapStatusToHubSpot(payload.lead.status),
      hs_lead_status: payload.lead.status,
      lead_source: payload.lead.source || 'OTHER',
      // Custom properties
      budget_range: payload.lead.budget_range,
      interested_treatments: payload.lead.interested_treatments?.join(', '),
      lead_score: payload.lead.lead_score,
      line_id: payload.lead.line_id,
      external_id: payload.lead.id,
      notes: payload.lead.notes || '',
    },
  }
}

/**
 * Transform lead data to Pipedrive format
 */
export function transformToPipedrive(payload: WebhookPayload) {
  return {
    title: `${payload.lead.full_name} - ${payload.clinic.name}`,
    person_name: payload.lead.full_name,
    org_name: payload.clinic.name,
    value: parseBudgetValue(payload.lead.budget_range),
    currency: 'THB',
    status: 'open',
    // Contact details
    email: payload.lead.email ? [{ value: payload.lead.email, primary: true }] : [],
    phone: payload.lead.phone ? [{ value: payload.lead.phone, primary: true }] : [],
    // Custom fields (need to be mapped to your Pipedrive account)
    // These are examples - replace with your actual custom field IDs
    '12345': payload.lead.status, // Custom field: Lead Status
    '12346': payload.lead.source, // Custom field: Lead Source
    '12347': payload.lead.lead_score, // Custom field: Lead Score
    '12348': payload.lead.interested_treatments?.join(', '), // Custom field: Interested Treatments
    '12349': payload.lead.line_id, // Custom field: Line ID
  }
}

/**
 * Helper: Map lead status to Salesforce status
 */
function mapStatusToSalesforce(status: string): string {
  const mapping: Record<string, string> = {
    new: 'Open - Not Contacted',
    contacted: 'Working - Contacted',
    hot: 'Working - Contacted',
    warm: 'Working - Contacted',
    cold: 'Nurturing',
    converted: 'Closed - Converted',
    lost: 'Closed - Not Converted',
  }
  return mapping[status] || 'Open - Not Contacted'
}

/**
 * Helper: Map lead status to HubSpot lifecycle stage
 */
function mapStatusToHubSpot(status: string): string {
  const mapping: Record<string, string> = {
    new: 'lead',
    contacted: 'marketingqualifiedlead',
    hot: 'salesqualifiedlead',
    warm: 'salesqualifiedlead',
    cold: 'lead',
    converted: 'customer',
    lost: 'other',
  }
  return mapping[status] || 'lead'
}

/**
 * Helper: Map lead score to rating (Hot/Warm/Cold)
 */
function mapScoreToRating(score: number): string {
  if (score >= 80) return 'Hot'
  if (score >= 60) return 'Warm'
  return 'Cold'
}

/**
 * Helper: Parse budget range to numeric value
 */
function parseBudgetValue(budgetRange?: string): number {
  if (!budgetRange) return 0

  if (budgetRange.includes('> ฿100,000')) return 100000
  if (budgetRange.includes('฿50,000 - ฿100,000')) return 75000
  if (budgetRange.includes('฿30,000 - ฿50,000')) return 40000
  if (budgetRange.includes('฿10,000 - ฿30,000')) return 20000
  if (budgetRange.includes('< ฿10,000')) return 5000

  return 0
}

/**
 * Helper: Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Example: Send lead to Salesforce
 */
export async function sendToSalesforce(
  payload: WebhookPayload,
  instanceUrl: string,
  accessToken: string
): Promise<WebhookResponse> {
  const config: WebhookConfig = {
    url: `${instanceUrl}/services/data/v58.0/sobjects/Lead`,
    method: 'POST',
    auth: {
      type: 'bearer',
      token: accessToken,
    },
  }

  const salesforcePayload = transformToSalesforce(payload)

  return sendCRMWebhook(
    { ...payload, lead: salesforcePayload } as any,
    config
  )
}

/**
 * Example: Send lead to HubSpot
 */
export async function sendToHubSpot(
  payload: WebhookPayload,
  apiKey: string
): Promise<WebhookResponse> {
  const config: WebhookConfig = {
    url: 'https://api.hubapi.com/crm/v3/objects/contacts',
    method: 'POST',
    auth: {
      type: 'api_key',
      api_key_header: 'Authorization',
      api_key_value: `Bearer ${apiKey}`,
    },
  }

  const hubspotPayload = transformToHubSpot(payload)

  return sendCRMWebhook(
    { ...payload, ...hubspotPayload } as any,
    config
  )
}

/**
 * Example: Send lead to Pipedrive
 */
export async function sendToPipedrive(
  payload: WebhookPayload,
  apiToken: string
): Promise<WebhookResponse> {
  const config: WebhookConfig = {
    url: `https://api.pipedrive.com/v1/deals?api_token=${apiToken}`,
    method: 'POST',
  }

  const pipedrivePayload = transformToPipedrive(payload)

  return sendCRMWebhook(
    { ...payload, ...pipedrivePayload } as any,
    config
  )
}
