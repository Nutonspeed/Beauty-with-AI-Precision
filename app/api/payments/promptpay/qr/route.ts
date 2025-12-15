import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { createServiceClient } from "@/lib/supabase/server"

function normalizePromptPayId(input: string): string {
  return String(input ?? "").replace(/[^0-9]/g, "")
}

function buildPromptPayPayload(promptpayId: string, amount: number): string {
  // Minimal, widely compatible PromptPay EMV payload (static for many apps).
  // NOTE: This is a best-effort payload. For production-grade compliance (CRC, ref fields,
  // biller IDs, etc.) you may later switch to a dedicated PromptPay library or gateway.

  const id = normalizePromptPayId(promptpayId)
  const amt = Number(amount)

  if (!id) throw new Error("promptpay_id is required")
  if (!Number.isFinite(amt) || amt <= 0) throw new Error("amount must be > 0")

  // Determine proxy type
  // mobile: 10 digits, citizen_id: 13 digits
  const isMobile = id.length === 10
  const isCitizen = id.length === 13
  if (!isMobile && !isCitizen) {
    throw new Error("promptpay_id must be 10 digits (mobile) or 13 digits (citizen_id)")
  }

  const formatTLV = (tag: string, value: string) => {
    const len = value.length.toString().padStart(2, "0")
    return `${tag}${len}${value}`
  }

  const formatMerchantAccount = () => {
    // Application ID for PromptPay: A000000677010111
    const aid = formatTLV("00", "A000000677010111")

    // Proxy type: 01 mobile, 02 citizen
    const proxyType = isMobile ? "01" : "02"
    const proxy = formatTLV("01", proxyType)

    // Proxy value: mobile requires country code +66 + last 9 digits
    // citizen uses 13 digits
    const proxyValue = isMobile ? `0066${id.slice(1)}` : id
    const proxyVal = formatTLV("02", proxyValue)

    return formatTLV("29", `${aid}${proxy}${proxyVal}`)
  }

  const formatAmount = () => {
    const fixed = amt.toFixed(2)
    return formatTLV("54", fixed)
  }

  // CRC tag will be appended later; we compute CRC16-CCITT
  const payloadNoCrc =
    formatTLV("00", "01") + // Payload format indicator
    formatTLV("01", "12") + // Point of initiation method (12=dynamic; widely accepted)
    formatMerchantAccount() +
    formatTLV("52", "0000") + // Merchant category code
    formatTLV("53", "764") + // Currency THB
    formatAmount() +
    formatTLV("58", "TH") + // Country
    formatTLV("59", "CLINICIQ") + // Merchant name (placeholder)
    formatTLV("60", "BANGKOK") + // City (placeholder)
    "6304" // CRC placeholder

  const crc = crc16ccitt(payloadNoCrc).toString(16).toUpperCase().padStart(4, "0")
  return payloadNoCrc + crc
}

function crc16ccitt(input: string): number {
  // CRC16-CCITT (0xFFFF) used for EMV QR
  let crc = 0xffff
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021
      else crc <<= 1
      crc &= 0xffff
    }
  }
  return crc & 0xffff
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinic_id = searchParams.get("clinic_id")
    const amountRaw = searchParams.get("amount")

    if (!clinic_id) {
      return NextResponse.json({ error: "clinic_id is required" }, { status: 400 })
    }

    const amount = Number(amountRaw)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be > 0" }, { status: 400 })
    }

    const service = createServiceClient()
    const { data: clinic, error: clinicError } = await service
      .from("clinics")
      .select("id, promptpay_id")
      .eq("id", clinic_id)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 })
    }

    if (!clinic.promptpay_id) {
      return NextResponse.json({ error: "Clinic PromptPay is not configured" }, { status: 400 })
    }

    const payload = buildPromptPayPayload(clinic.promptpay_id, amount)

    const svg = await QRCode.toString(payload, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (e: any) {
    const message = e?.message || "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
