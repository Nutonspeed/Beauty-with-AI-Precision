# ClinicIQ AI Copilot Instructions

**Project**: ClinicIQ — Intelligent Aesthetic Platform  
**Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS + Supabase  
**Status**: Production-ready (v1.1.0)

---

## 🏗️ Architecture at a Glance

### Layered Architecture
```
Client (Next.js 16 + React 19)
  ↓ (REST + Server Actions + WebSocket)
API Layer (50+ Routes in app/api/**)
  ↓ (Supabase Client + Service Client)
Supabase Backend (PostgreSQL + Storage + Realtime)
  ↓ (External Calls)
AI Services (Google Vision, HuggingFace, MediaPipe)
```

### Key Data Flows
- **Skin Analysis**: Upload image → Multi-tier storage (original/display/thumbnail) → AI analysis (hybrid-skin-analyzer.ts) → Store results in DB → Display VISIA report + 3D AR viewer
- **Real-time Chat**: React component → ChatManager hook → WebSocket → Supabase Realtime → Store in database
- **Lead Management**: Sales staff interaction → AI lead scorer → Real-time dashboard updates

---

## 📁 Project Structure

### Core Directories
| Directory | Purpose |
|-----------|---------|
| `app/[locale]/` | 49 pages (SSR/CSR/SSG/ISR) organized by feature |
| `app/api/` | 50+ REST endpoints + Server Actions |
| `components/` | 200+ React components (UI, features, layouts) |
| `lib/` | Business logic: AI, auth, DB, realtime, utils |
| `lib/ai/` | Hybrid AI pipeline, multiple model integrations |
| `hooks/` | 35+ custom React hooks (useChat, useAI, etc.) |
| `__tests__/` | Vitest unit tests + Playwright E2E tests |
| `prisma/` | Database schema (PostgreSQL) |
| `public/` | Static assets, PWA manifest |

### Critical Files to Know
- **`next.config.mjs`**: Webpack config, image optimization, headers
- **`tsconfig.json`**: Path aliases (`@/*`) for imports
- **`vitest.config.mjs`**: Unit test environment (happy-dom, Windows-aware pool config)
- **`playwright.config.ts`**: E2E tests (5 browser combos: Chrome, Firefox, Safari, Mobile)
- **`lib/supabase/server.ts`**: Service client initialization (bypasses RLS for server operations)

---

## 🤖 AI Analysis System (Hybrid Multi-Source)

### Current Implementation
Not using single AI gateway—uses 4+ parallel AI models:

| Model | Purpose | File |
|-------|---------|------|
| **MediaPipe** | 468 facial landmarks + face detection | `lib/ai/mediapipe-detector.ts` |
| **Google Vision** | Skin condition detection (acne, spots, wrinkles) | `lib/ai/google-vision-skin-analyzer.ts` |
| **HuggingFace** | Advanced semantic skin analysis | `lib/ai/huggingface-analyzer.ts` |
| **TensorFlow.js** | Client-side lightweight segmentation | `lib/ai/tensorflow-analyzer.ts` |

### Data Flow
1. User uploads image → `components/skin-analysis-upload.tsx`
2. Image stored in multi-tier format:
   - **Original** (PNG 100%): Full resolution for re-analysis
   - **Display** (JPEG 85%): For results pages
   - **Thumbnail** (WebP 80%): For list views
3. All tiers uploaded to Supabase Storage (`analysis-images/`)
4. **Hybrid analyzer orchestrator** (`lib/ai/hybrid-skin-analyzer.ts`) runs parallel analysis
5. Results aggregated + mapped to VISIA metrics (8 scores: spots, pores, texture, etc.)
6. Stored in `analyses` table with image paths + AI confidence scores
7. Frontend renders VISIA report + 3D AR model (`components/ar/ar-visualization.tsx`)

### When Adding AI Features
- Don't hardcode results—use actual model outputs
- Prefer `hybrid-skin-analyzer.ts` as orchestrator (not individual analyzers)
- Cache model weights in `lib/ai/model-cache.ts`
- Wrap external API calls with retry logic (`lib/ai/retry-utils.ts`)
- Test with `__tests__/ai-pipeline.test.ts` pattern

---

## 🔌 API Design Pattern

### Pattern: Protected Route Handlers
```typescript
// app/api/[resource]/route.ts
import { withClinicAuth } from '@/lib/api-middleware/auth'

export const GET = withClinicAuth(async (request: NextRequest) => {
  // `request.user` and `request.clinic` already attached by middleware
  const supabase = createServerClient(request)
  const { data, error } = await supabase.from('table').select()
  return NextResponse.json(data)
})
```

### Common Middleware
- **`withClinicAuth`**: Requires clinic owner/admin
- **`withPublicAccess`**: No auth required
- **`withUserAuth`**: Customer-only access
- Rate limiting applied at endpoint level (100-1000 req/min depending on endpoint)

### Response Format
Always return `NextResponse.json()`. Errors use standard structure:
```typescript
NextResponse.json({ error: 'message' }, { status: 400 })
```

---

## 🎨 Frontend Patterns

### Rendering Strategy
- **Landing pages** → SSG (static generation) for SEO
- **Auth pages** → SSR (server-side render) for security
- **AR/3D features** → CSR (client-side render) for heavy 3D
- **Analysis results** → SSR + ISR (cache + revalidate)

### State Management
- **Server state**: SWR with `useFetch()` hook
- **Client state**: `useState()` for UI, `useReducer()` for complex flows
- **Form state**: `react-hook-form` with Zod validation
- **Global state**: React Context (minimal—prefer prop drilling)

### Key Hooks to Leverage
- **`useAuth()`**: Current user + session
- **`useAIChat()`**: Chat functionality with context awareness
- **`useLiveARPreview()`**: Real-time AR treatment visualization
- **`useAnalysisMode()`**: Multi-mode analysis state (manual, auto, 3D)
- **`useAnalytics()`**: Usage tracking + performance monitoring

### Component Structure
```
components/
├── ui/           # Shadcn/Radix primitives (Button, Card, etc.)
├── ai/           # AI-specific (chat, analysis)
├── ar/           # 3D/AR visualization
├── layouts/      # Page templates
├── [feature]/    # Feature-grouped components
└── [shared]/     # Shared across multiple features
```

---

## 🗄️ Database (Supabase PostgreSQL)

### Key Tables
| Table | Purpose | Note |
|-------|---------|------|
| `users` | Customer/staff profiles | Multi-role: customer, staff, admin, owner |
| `analyses` | Skin analysis results | Stores VISIA scores + image paths |
| `analysis_images` | Image metadata | Tracks original/display/thumbnail tiers |
| `chat_messages` | Realtime chat history | Indexed on `session_id` + `created_at` |
| `leads` | Sales leads with AI scores | Auto-scored by `lead-prioritization.ts` |
| `clinics` | Tenant data (multi-tenant) | Supports multiple clinics in single DB |
| `treatments` | Treatment plans | Linked to analyses + users |

### Access Patterns
- **Server**: Use `createServerClient()` from `lib/supabase/server.ts` (bypasses RLS)
- **Client**: Use `createClient()` from `lib/supabase/client.ts` (enforces RLS policies)
- **Realtime**: Subscribe to channels in hooks (e.g., `useChat()` watches `chat_messages`)

### RLS (Row-Level Security)
Enabled on most tables. Bypass with service client only when necessary (admin operations, batch jobs).

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- Location: `__tests__/[module].test.ts`
- Command: `pnpm test` or `pnpm test:stable` (Windows-friendly)
- Setup: `__tests__/setup.ts` mocks EventListener APIs
- Example: `__tests__/ai-pipeline.test.ts` tests mock AI results

### E2E Tests (Playwright)
- Location: `__tests__/e2e/`
- Command: `pnpm test:e2e` (starts Next.js on port 3004)
- Runs on 5 browser combos (Chrome, Firefox, Safari, Pixel 5, iPhone 12)
- Use `baseURL: http://localhost:3004` from playwright config

### Test Patterns
```typescript
describe('Feature', () => {
  it('should do something', () => {
    expect(result).toBe(expected)
  })
})
```

### Windows-Specific Config
Tests default to single-threaded on Windows to avoid pool timeout issues. Configured in `vitest.config.mjs`.

---

## 🔐 Authentication & Authorization

### NextAuth.js with JWT
- Strategy: JWT session (not database session)
- Max age: 30 days
- Provider: Credentials (email/password) currently, but extensible

### Role-Based Access
| Role | Access |
|------|--------|
| `customer` | Own analyses, chat, booking |
| `staff` | Clinic dashboard, lead management |
| `admin` | Clinic configuration, staff management |
| `owner` | Billing, clinic creation |

### Middleware Pattern
```typescript
// Checks session in app/middleware.ts, attached to request.user
export const middleware = async (request: NextRequest) => {
  const session = await getServerSession(authOptions)
  request.user = session?.user
}
```

---

## 🌍 Internationalization (i18n)

### Pattern: next-intl
- Locale selector: `[locale]` dynamic route parameter (e.g., `/en/`, `/th/`)
- Translations: `i18n/locales/[locale].json`
- Hook: `useLanguage()` for component-level access
- Server: `getMessages()` in Server Components

### Adding New Language
1. Create `i18n/locales/[code].json` with translations
2. Add to `locales` array in `i18n/request.ts`
3. Test with locale switcher

---

## 📊 Build & Deployment

### Development
- Command: `pnpm dev` or `pnpm dev:webpack:3004` (starts on port 3004)
- Webpack enabled for faster iteration
- Watch mode active

### Production Build
```bash
pnpm prod:build    # NODE_ENV=production + optimizations
pnpm prod:start    # Run production server
```

### CI/CD
- Full build: `pnpm build:ci` → lint + type-check + build + schema assert
- Fast build: `FAST_BUILD=1 pnpm build` → skips source maps + compression
- Vercel deployment: Automatic on push (see `vercel.json`, `vercel.static.json`)

### Type Checking
- Command: `pnpm type-check`
- Must pass before deployment (0 errors required)

---

## 🚀 Common Development Workflows

### Adding a New Feature
1. Create page in `app/[locale]/[feature]/page.tsx`
2. Create components in `components/[feature]/`
3. Create hooks in `hooks/use[Feature].ts` if needed
4. Create API routes in `app/api/[feature]/route.ts`
5. Add tests in `__tests__/[feature].test.ts`
6. Update types in `types/index.ts`

### Debugging
- Use `console.log()` in dev—logs visible in terminal
- Browser DevTools for client-side debugging
- Playwright `--debug` flag: `pnpm test:e2e --debug`
- Check database with `pnpm check:db`

### Performance Optimization
- Image optimization: handled by Next.js (AVIF/WebP formats)
- Bundle analysis: `ANALYZE=true pnpm build`
- Code splitting: automatic via Next.js dynamic imports
- Monitor with `lib/monitoring/performance-monitor.ts`

---

## ⚠️ Common Pitfalls

1. **Mixing server/client code**: Use `"use client"` for browser APIs (Canvas, WebSocket, localStorage)
2. **Importing client components in Server Components**: Will fail—import only exported functions
3. **Hardcoded AI results**: Always fetch from actual models (via hybrid-analyzer)
4. **Missing error boundaries**: Wrap async operations with try-catch
5. **Not setting `Content-Type` headers**: API responses need `application/json`
6. **Forgetting Supabase RLS**: Server client bypasses RLS—use for admin ops only
7. **Windows test timeouts**: Tests default to single-threaded; don't change unless necessary

---

## 🔍 Key Files to Review First

1. **Architecture Overview**: `docs/architecture/ARCHITECTURE.md`
2. **Database Schema**: `prisma/schema.prisma`
3. **API Middleware**: `lib/api-middleware/`
4. **Hybrid AI Analyzer**: `lib/ai/hybrid-skin-analyzer.ts`
5. **Chat Manager**: `lib/chat/chat-manager.ts`
6. **Auth Pattern**: `lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts`

---

## 📞 Quick Commands

```bash
pnpm dev                    # Start dev server (port 3004)
pnpm test                   # Run unit tests in watch mode
pnpm test:stable            # Run unit tests (Windows-safe)
pnpm test:e2e               # Run E2E tests (requires dev server)
pnpm lint                   # Check for lint errors
pnpm type-check             # TypeScript type checking
pnpm build                  # Production build (webpack)
pnpm prod:build             # Build with optimizations
```

---

## 🎯 Writing AI-Agent-Friendly Code

When implementing new features:
- **Comment decision points**: Explain why a pattern was chosen
- **Export clear interfaces**: Type definitions help agents understand contracts
- **Keep functions <50 lines**: Easier for agents to reason about
- **Test complex logic**: Unit tests serve as documentation + validation
- **Use semantic file names**: Avoid generic names like `utils.ts`
