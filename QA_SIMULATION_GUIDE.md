# AI Precision Beauty - QA & UAT Simulation Guide

## 1. Customer Evolution Journey (End-to-End)

### Phase 1: Diagnostic Initialization
- **Action**: Access the AI Skin Analysis tool.
- **Goal**: Perform a full facial scan.
- **Verification**:
  - Image optimization (AVIF/WebP) works during processing.
  - Results are saved to the history node.
  - Overall score and detailed biological markers (spots, pores, wrinkles) are generated.

### Phase 2: Knowledge Sharing
- **Action**: Click "Share Report" and generate a verified public link.
- **Goal**: Open the link in an Incognito/Private window.
- **Verification**:
  - Premium UI (`ShareReportView`) renders with high-resolution imagery.
  - Staggered animations and spring-based transitions appear fluid.
  - "Neural trust" bars and metric badges display correct data.

### Phase 3: Engagement & Re-entry
- **Action**: Spend >120 seconds on the shared report page, scrolling to the bottom.
- **Goal**: Trigger the telemetry heartbeat.
- **Verification**:
  - Lead score for the user should automatically increase in the Sales Dashboard.
  - Sales staff should receive a "High Engagement Alert" notification.
  - Activity feed should record "Aesthetic Report Viewed".

### Phase 4: Proactive Concierge Interaction
- **Action**: Open the AI Virtual Concierge.
- **Goal**: Ask "What is my next step?" or "Show my roadmap progress".
- **Verification**:
  - AI provides a "Roadmap Summary" pulling from the active treatment plan.
  - Concierge identifies the next pending node (step) and focus area.
  - Response is technical, professional, and reflects the correct language (TH/EN).

---

## 2. Clinic Owner Orchestration (Administrative Flow)

### Phase 1: Strategic Resource Allocation
- **Action**: Access "System Settings" -> "Quota & Team".
- **Goal**: Perform a "Bulk Allocation" to all staff nodes.
- **Verification**:
  - Success message appears with shimmer effect.
  - Audit log (`QuotaTransferHistory`) records the transaction.
  - Staff receive a "Quota Boost Synchronized" notification.

### Phase 2: Neural Rebalancing
- **Action**: View "Neural_Rebalance_Engine" suggestions.
- **Goal**: Click "Execute_Sync" on a high-priority suggestion.
- **Verification**:
  - Exit animation triggers for the resolved suggestion.
  - Quota is instantly transferred between the source and target nodes.
  - Status updates to "Quota_Optimized" if no more suggestions remain.

### Phase 3: ROI Intelligence Audit
- **Action**: Access "Revenue Dashboard" -> "Efficiency_Matrix".
- **Goal**: Analyze the scatter plot and detailed yield table.
- **Verification**:
  - Top performers are highlighted in the "High_Yield_Nodes" cards.
  - Efficiency Index (xFactor) and Attributed ROI match the sales team performance.
  - Data points respond to hover with detailed tooltips.

---

## 3. Technical Stability Check (Pre-Handover)

### Verification Commands:
- `pnpm type-check`: Must exit with 0 errors.
- `pnpm lint`: Review all critical warnings.
- `pnpm build`: Verify successful production bundle generation.

---
*QA Audit v4.2 - Production Ready.*
