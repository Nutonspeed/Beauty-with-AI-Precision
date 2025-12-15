import { describe, it, expect, vi, beforeEach } from "vitest"

import { acceptProposal, bookFromProposal } from "@/lib/sales/proposals-service"
import { createServerClient } from "@/lib/supabase/server"

function createSupabaseMock() {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => chain),
    update: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    single: vi.fn(async () => ({ data: null, error: null } as any)),
    maybeSingle: vi.fn(async () => ({ data: null, error: null } as any)),
  }

  return {
    chain,
    client: {
      from: vi.fn(() => chain),
    },
  }
}

const supabaseMock = createSupabaseMock()

const publisherMock = {
  publish: vi.fn(async () => undefined),
}

vi.mock("@/lib/supabase/server", async () => {
  return {
    createServerClient: vi.fn(async () => supabaseMock.client),
  }
})

vi.mock("@/lib/events/event-publisher", () => {
  return {
    getEventPublisher: () => publisherMock,
    createEvent: (...args: any[]) => ({ type: args[0], payload: args[1], meta: args[2] }),
  }
})

describe("Consultation workflow (proposal -> accept -> book)", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // keep createServerClient returning our shared mock
    vi.mocked(createServerClient).mockResolvedValue(supabaseMock.client as any)
  })

  it("acceptProposal: updates proposal to accepted and lead to won", async () => {
    // check.single() -> existing proposal in 'sent'
    supabaseMock.chain.single
      .mockResolvedValueOnce({ data: { id: "p1", status: "sent", lead_id: "l1", title: "T" }, error: null })
      // updateQuery.single() -> updated proposal with lead relation
      .mockResolvedValueOnce({
        data: {
          id: "p1",
          status: "accepted",
          clinic_id: "c1",
          lead: { id: "l1", clinic_id: "c1", name: "N", email: "e@x.com", phone: null, status: "proposal_sent" },
        },
        error: null,
      })

    const result = await acceptProposal("u1", "c1", "p1")

    expect(result.status).toBe("accepted")

    // ensure we attempted to update proposal
    expect(supabaseMock.client.from).toHaveBeenCalledWith("sales_proposals")

    // ensure lead status updated to won
    expect(supabaseMock.client.from).toHaveBeenCalledWith("sales_leads")
    expect(supabaseMock.chain.update).toHaveBeenCalledWith(expect.objectContaining({ status: "won" }))
  })

  it("bookFromProposal: creates appointment in appointments table", async () => {
    // Proposal query .single()
    supabaseMock.chain.single
      .mockResolvedValueOnce({
        data: {
          id: "p1",
          status: "accepted",
          clinic_id: "c1",
          lead_id: "l1",
          lead: { id: "l1", clinic_id: "c1", name: "N", email: "e@x.com", phone: "123", status: "won" },
          metadata: {},
        },
        error: null,
      })

    // customers maybeSingle -> not found
    supabaseMock.chain.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    // customers insert -> returns customer id
    supabaseMock.chain.single
      .mockResolvedValueOnce({ data: { id: "cust1" }, error: null })
      // clinic_services single -> returns service details
      .mockResolvedValueOnce({ data: { id: "svc1", name: "Botox", price: 100, duration_minutes: 30 }, error: null })
      // appointments insert -> returns created appointment
      .mockResolvedValueOnce({
        data: {
          id: "a1",
          clinic_id: "c1",
          customer_id: "cust1",
          service_type: "Botox",
          appointment_date: "2025-01-01",
          appointment_time: "10:00",
          status: "scheduled",
        },
        error: null,
      })

    const appointment = await bookFromProposal("u1", "c1", "p1", {
      booking_date: "2025-01-01",
      booking_time: "10:00:00",
      service_id: "svc1",
      customer_notes: undefined,
      internal_notes: undefined,
    })

    expect(appointment.status).toBe("scheduled")

    // Best-effort persist linkage back to proposal
    expect(supabaseMock.client.from).toHaveBeenCalledWith("sales_proposals")
    expect(supabaseMock.chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        appointment_id: "a1",
        metadata: expect.objectContaining({ appointment_id: "a1" }),
      }),
    )

    // Event emitted
    expect(publisherMock.publish).toHaveBeenCalled()
    const first = ((publisherMock.publish as any).mock.calls as any[]).at(0)
    const firstCall = (Array.isArray(first) ? first[0] : null) as any
    expect(firstCall?.type).toBe("proposal.booked")
    expect(firstCall?.payload?.metadata?.appointment_id).toBe("a1")

    // verify canonical insert into appointments
    expect(supabaseMock.client.from).toHaveBeenCalledWith("appointments")
    expect(supabaseMock.chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      clinic_id: "c1",
      customer_id: "cust1",
      status: "scheduled",
    }))
  })
})
