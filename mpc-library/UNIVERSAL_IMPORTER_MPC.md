## Universal Data Importer (CSV/XLSX/Screenshots) — Design and Execution Plan

### Summary
Build a universal importer that ingests large CSV/XLSX files and screenshots of tables, replicates spreadsheet functions where possible, reconciles extracted tables to our Prisma schema, and safely writes valid rows while quarantining invalid ones. The importer must never fail the entire process if some data cannot be mapped; instead, it flags unreconciled tables/columns and offers the user an option to proceed with a partial import or cancel.

### Goals
- Support inputs: CSV, XLSX (values and formulas), screenshots (PNG/JPG/PDF pages with tabular data).
- Extract, normalize, and map tables to Prisma models with semantic matching and user overrides.
- Recompute spreadsheet formulas where feasible; preserve original formulas for audit.
- Provide reconciliation reports and a user flow to approve mappings before commit.
- Ensure safe, idempotent, chunked writes with robust observability and cost controls.

### Non‑Goals
- Full fidelity conversion of every Excel/Numbers function. We provide best-effort via a calculation engine and sensible fallbacks.
- Modifying existing app schemas to fit imports. The importer adapts to current schema.

---

## Architecture

- Client (Import Wizard)
  - Steps: Upload → Detect & Map → Preview & Reconcile → Commit
  - Surfaces suggested mappings, confidence, unreconciled items, sample errors
  - Options to proceed partially, fix mapping, or cancel

- Server (Firebase Functions/Express)
  - Endpoints to create sessions, parse inputs (background job), stream status, and commit
  - Parsers: CSV (streamed), XLSX (values + formulas), Images (Gemini Vision)
  - Reconciliation engine: model/field mapping, validation via Zod against Prisma models
  - Writer: chunked, idempotent `createMany` and targeted `upsert` using unique keys
  - Storage: raw uploads + normalized JSON + reconciliation report and audit logs

- Queue/Workers
  - Background parsing and writing; never block request/response paths

- Observability
  - Structured logs, metrics, per-session progress, downloadable reports

---

## Data Flow (High-Level)
1) User uploads files → `POST /api/imports/session` returns sessionId and signed URLs
2) Client uploads to storage and calls `POST /api/imports/parse` (async job)
3) Worker extracts tables → normalizes → attempts model/field mapping → validates
4) Worker stores reconciliation summary; client polls `GET /api/imports/:id/status` or SSE
5) User reviews mapping, adjusts if needed → `POST /api/imports/:id/commit`
6) Worker performs chunked writes; invalid rows quarantined; final report stored

---

## API Endpoints (Draft)
- POST `/api/imports/session`
  - Body: { files: [{name, type}], hints?: { targetModels?: string[], locale?: string } }
  - Returns: { sessionId, uploadUrls[] }

- POST `/api/imports/parse`
  - Body: { sessionId }
  - Action: enqueue parse job; returns 202

- GET `/api/imports/:id/status`
  - Returns: { status, progress, detectedTables[], issues[], mappingSuggestion, counts }

- POST `/api/imports/:id/commit`
  - Body: { approvedMapping, options?: { upsertBy?: string[], dryRun?: boolean } }
  - Returns: { jobId }

- POST `/api/imports/:id/cancel`
  - Cancels pending or running jobs; marks session cancelled

- Optional: SSE `/api/imports/:id/stream` for live progress

---

## Core Data Contracts

- ImportSession
  - id, userId, status: created|parsing|ready_for_review|committing|completed|failed|cancelled
  - files: [{ name, type: csv|xlsx|image|pdf, size, storagePath }]
  - detectedTables: DetectedTable[]
  - mappingSuggestion: MappingPlan
  - approvedMapping?: MappingPlan
  - issues: Issue[]
  - counts: { detectedTables, mappedTables, rowsValid, rowsInvalid, rowsWritten }
  - artifacts: { normalizedJsonPath?, reconciliationReportPath? }
  - createdAt, updatedAt

- DetectedTable
  - source: csv|xlsx|image|pdf
  - tableName: string
  - headers: string[]
  - rowsSample: string[][]
  - inferredTypes: Record<string, string>
  - confidence: number
  - notes?: string

- MappingPlan
  - tableToModel: Array<{ tableName: string, modelName?: string, confidence: number }>
  - columnToField: Record<string /* table.column */ , { modelField?: string, transform?: string, confidence: number }>
  - uniqueKeys: Record<string /* model */ , string[] /* fields used for upsert */>

- Issue
  - type: UnreconciledTable | UnmappedColumn | RowValidationError | UnsupportedFunction
  - details: string
  - samples?: any[]

---

## Parsing and Normalization

- CSV
  - Stream using PapaParse with header mode; autodetect delimiter; chardet for encoding
  - Normalize headers to snake_case; capture raw and normalized

- XLSX
  - Read with SheetJS; preserve original formulas and displayed values
  - Build in-memory grid per sheet

- Formula Replication
  - Primary: HyperFormula for recalculation (broad Excel compatibility)
  - Gap-fill: Formula.js for missing functions
  - Fallback: retain displayed values when functions unsupported; log UnsupportedFunction issues
  - Persist both computedValue and originalFormula for auditable fields when relevant

- Screenshots / PDFs
  - Gemini Vision with strict structured output to JSON:
    - Output schema: `{ tables: [{ tableName: string, headers: string[], rows: string[][], confidence: number, notes?: string }] }`
  - Prompt guidance: normalize headers; preserve units as strings if ambiguous; do not invent values; return only JSON

---

## Mapping and Reconciliation

- Schema Introspection
  - Read Prisma schema to collect models, fields, types, unique constraints
  - Generate Zod validators for each model shape

- Auto-Mapping Heuristics
  - Name similarity (Levenshtein, token match), synonyms, domain hints (email, currency, dates)
  - Value-profile similarity (e.g., UUID vs email vs numeric id)
  - Confidence scoring and top-3 candidates surfaced to UI

- User Overrides
  - UI to choose model for each table, map columns→fields, and set uniqueKeys for upserts
  - Transformations (trim, parse currency/percent, date parsing) selectable per column

- Validation
  - Zod validation on normalized rows; classify row-level errors
  - Never block entire import; quarantine invalid rows with reason samples

---

## Writing Strategy (Prisma)

- Batching
  - Chunk `createMany` (e.g., 500–1,000 rows) with `skipDuplicates`
  - Upsert path for models with stable unique keys (user-provided or inferred)

- Idempotency & Retries
  - Idempotency key: `${sessionId}:${modelName}:${rowHash}`
  - Exponential backoff with capped retries; DLQ for persistent failures

- Transactions
  - Use small transactions around each chunk; avoid long-lived locks

---

## Security, Compliance, and Cost Controls

- Privacy & PII
  - Store uploads in restricted buckets; signed URLs; time-limited access
  - Do not log raw values; sample errors redacted where needed
  - Retention policy for raw files and normalized artifacts

- Compliance
  - Record consent and audit entries for import actions (start, mapping approved, commit)

- Cost Controls
  - Quotas on rows, file sizes, number of pages/images per session
  - Token budgets for Gemini calls; enforce hard caps and per-tenant limits
  - Kill switch feature flag

---

## Observability

- Metrics
  - Imports started/completed/failed, per-model rows written, rows invalid, cost per session
- Logs
  - Structured JSON; include sessionId, model, chunkId, and idempotencyKey
- Reports
  - Reconciliation report artifact: included/excluded tables, errors, counts, decisions

---

## Rollout Plan

- Phase 0 (Hidden): feature flag, background workers, metrics, kill switch
- Phase 1 (Dry-Run): CSV/XLSX parsing → reconciliation only; no DB writes
- Phase 2 (Limited Writes): select models, small batches; internal users only
- Phase 3 (Canary): broader models, partial import enabled; canary tenants
- Phase 4 (Vision): enable screenshots/PDF via Gemini; stricter quotas

Go/No-Go Checklist
- Background jobs isolated from user API paths
- Feature flag + allowlist enabled
- Idempotent writes, retries, DLQ in place
- Quotas/timeouts and cost alerts configured
- Dry-run reports validated in staging
- Kill switch tested

---

## Work Breakdown (Execution Plan)

Epic: Universal Importer MVP (4–6 weeks, parallelizable)

1) Foundations (Week 1)
   - Server scaffolding: endpoints, session model, storage service
   - Feature flag, allowlist, kill switch
   - Queue/worker setup; structured logging/metrics

2) Parsers (Week 1–2)
   - CSV streaming with delimiter/encoding autodetect
   - XLSX read + HyperFormula evaluation; preserve original formulas
   - Normalization to canonical table objects

3) Schema Introspection & Validation (Week 2)
   - Parse Prisma schema → model metadata + Zod validators
   - Type inference and basic transformations (currency/percent/date)

4) Auto-Mapping & Reconciliation (Week 2–3)
   - Name/value similarity, confidence scoring, issue classification
   - Reconciliation report artifact

5) Client Import Wizard (Week 3–4)
   - Steps: Upload → Map → Preview → Commit
   - Show suggestions, confidence, unreconciled items, sample errors
   - Approve mapping and commit

6) Writer (Week 3–4)
   - Chunked `createMany` + selective `upsert` with idempotency keys
   - Retries with backoff; DLQ and quarantined rows store

7) Vision (Week 4–5)
   - Gemini structured extraction for screenshots/PDF pages
   - Post-processing, confidence scores, integration into reconciliation

8) Hardening (Week 5–6)
   - Cost controls, quotas, timeouts
   - Security review, PII redaction, retention policy
   - E2E tests on large datasets; staging dry-runs

---

## Gemini Prompt (Structured Output Skeleton)

System instruction: You extract tabular data from images for database import. Return JSON matching this schema exactly. Do not include prose.

JSON schema:
```
{
  "tables": [
    {
      "tableName": "string",
      "headers": ["string"],
      "rows": [["string"]],
      "confidence": 0.0,
      "notes": "string?"
    }
  ]
}
```

User hints:
- Expected model: <optional>
- Known headers: <optional>
- Locale/units: <optional>

---

## Testing Strategy

- Unit: parser normalization, mapping scorer, Zod validation, chunked writer
- Integration: end-to-end dry-run on fixture CSV/XLSX; commit with idempotency
- Vision: golden images with expected JSON output and tolerance for OCR variance
- Load: large CSV (≥ 1M rows) streamed; monitor memory/time; verify quotas

---

## References
- Excel functions reference (Microsoft): see official documentation
- Apple Numbers functions: see official documentation
- SheetJS (XLSX) and HyperFormula (calculation engine)
- PapaParse (CSV streaming) and chardet (encoding)
- Gemini API (Vision + structured output)
- Prisma batching (createMany, upsert) and idempotency patterns


