# LeadLoop AI

LeadLoop AI turns incoming customer conversations into structured, qualified, and actionable sales opportunities while keeping uncertain decisions under human control.

**AI BuildFest 2026**

**Participant ID:** BF-0330

## The Problem

Businesses receive customer enquiries through websites, inboxes, and internal notes, but valuable opportunities are often lost because of:

- manual CRM entry;
- slow response times;
- inconsistent qualification;
- duplicate customer records;
- missed follow-ups; and
- fragmented communication channels.

## The Solution

LeadLoop sends each supported enquiry through one shared processing pipeline:

```text
Customer Enquiry
      -> AI Agent
      -> Structured Extraction
      -> Contact & Confidence Validation
      -> Duplicate Detection
      -> Human Review when necessary
      -> CRM Lead
      -> Sales Rep Assignment
      -> Follow-Up Task & Notification
      -> Automation Tracking
```

The AI Agent extracts contact and opportunity data, summarizes the request, scores the lead, recommends a next action, and reports its confidence. Deterministic application rules then decide whether the result can safely enter the CRM or must pause for review.

## Key Features

- **AI-powered lead extraction:** Mistral's `mistral-small-latest` model returns structured JSON containing contact details, service, budget, timeline, intent, summary, lead score, priority, recommended action, confidence, and missing fields.
- **Three implemented intake paths:** authenticated manual intake, Gmail inbox intake, and bearer-token-protected website/API webhooks.
- **Human-in-the-Loop review:** low-confidence enquiries and enquiries without a usable email or phone number pause before CRM creation.
- **Deterministic contact gate:** a valid email or a phone number with at least seven digits is required before a CRM lead can be created or approved.
- **Duplicate and idempotency controls:** exact repeated manual submissions are stopped before processing; provider/webhook `externalId` values prevent replay; existing leads are matched by email within the company; identical pending task titles are not recreated.
- **Existing-lead interaction history:** a new enquiry from an existing email updates the lead and is attached to its interaction timeline.
- **Automatic assignment:** the pipeline selects a company sales representative and falls back to a company administrator when no sales representative is found.
- **Follow-up automation:** the recommended action can create an assigned pending task and an in-app notification.
- **Observable automation runs:** runs and individual steps store their status, output, error, source, and current processing step for inspection in the dashboard.
- **Company workspaces:** signup creates a company and associates the first user with it as an administrator; processing records carry company context throughout the pipeline.
- **Encrypted Gmail credentials:** Google OAuth tokens are encrypted with AES-256-GCM before database storage and updated when Google refreshes them.
- **Hashed integration keys:** webhook keys are generated from cryptographically secure random bytes, stored only as SHA-256 hashes, and shown in raw form once.

## How LeadLoop Works

1. An enquiry arrives through manual intake, Gmail, or the website/API webhook.
2. LeadLoop records an interaction and an automation run, then performs AI extraction after returning control to the user interface.
3. The AI Agent structures the conversation and generates qualification fields, a score, a recommended action, and a confidence value.
4. LeadLoop requires at least one usable contact method and checks the confidence threshold of `0.70`.
5. Uncertain or incomplete results pause in the Review Queue. Qualified results continue automatically.
6. Within the company, LeadLoop checks for an existing lead with the same email. It updates that lead or creates a new one.
7. The pipeline assigns a representative, creates a follow-up task when an action is recommended, creates an in-app notification, and completes the automation run.
8. The dashboard exposes leads, interaction timelines, tasks, review items, automation runs, and step-level trace data.

## Human-in-the-Loop AI

LeadLoop does not blindly write uncertain AI output into the CRM. If confidence is below `0.70`, or both email and phone are missing or invalid, automation pauses and creates a Review Queue item.

A reviewer can:

- inspect the original enquiry;
- review the AI-extracted information and confidence;
- correct contact, company, service, budget, and timeline fields;
- approve the corrected result and resume CRM automation; or
- reject the enquiry and close its automation run as rejected.

Approval is still subject to the deterministic email-or-phone requirement. This combination of AI assistance and human verification is safer for operational CRM data than unconditional model output.

## Multi-Channel Intake

### Manual Intake

Authenticated users can paste an email, message, conversation, or sales note into `/f/intake`. The page queues processing, polls the automation run, displays progress, and detects exact repeated submissions before another run or task is created.

### Website / API

`POST /api/webhooks/intake` accepts a raw enquiry plus optional structured data, metadata, source, and external ID. The endpoint requires an active integration bearer key. Only the SHA-256 hash of that key is stored, and the company is derived from the matching integration rather than accepted from the payload.

### Gmail

An authenticated workspace user can connect Gmail through Google OAuth. The adapter reads recent unread inbound messages, extracts plain text or converts HTML to text, supplies sender information to the shared pipeline, and uses the Gmail message ID for idempotency. Successfully handed-off messages are marked as read; fatal processing exceptions leave them unread for a later sync attempt.

All three paths feed `processIncomingLead`, so qualification, review, CRM updates, assignment, tasks, notifications, and trace logging follow the same central workflow.

## Multi-Tenant Security

The current application code propagates `company_id` through profiles, integrations, interactions, leads, tasks, notifications, review items, automation runs, and steps. Authenticated manual and Gmail flows derive the company from the signed-in user's profile. The public webhook derives it from the active integration key, which prevents a caller from selecting another company in the request body. Queries in the processing pipeline also include company context for duplicate detection and representative selection.

The checked-in `supabase_setup.sql` enables PostgreSQL Row-Level Security on its baseline tables, but it is not a complete representation of the schema expected by the current application: it does not define the `companies` table or the `company_id` columns and tenant-aware relationships referenced by the source, and its included policies grant broad access to authenticated users rather than company-scoped access. It should therefore be treated as a legacy baseline, not as a complete tenant-isolation migration. A synchronized, tenant-scoped schema migration is required before reproducing the current deployment from scratch.

## Architecture

```text
Manual Intake       Gmail / Google OAuth       Website / API Webhook
      |                       |                 (hashed bearer key)
      +-----------------------+--------------------------+
                              |
                     Shared Intake Service
                              |
                  Interaction + Automation Run
                              |
                    Mistral AI Agent (JSON)
                              |
             Contact Rule + Confidence Validation
                              |
                  +-----------+-----------+
                  |                       |
          Qualified result          Needs Review
                  |                       |
      Company email duplicate       Human corrects
              check                 / approves / rejects
                  |                       |
                  +-----------<-----------+
                              |
                 Lead create or update
                              |
           Rep assignment + Task + Notification
                              |
              Interaction Timeline + Run Trace
```

## Technology Stack

- Next.js 16.3.3 App Router
- React 19.2.8 and TypeScript
- Tailwind CSS 4
- Supabase Auth, Supabase JavaScript/SSR clients, and PostgreSQL
- Mistral AI TypeScript SDK with `mistral-small-latest`
- Gmail API and Google OAuth through `googleapis`
- Framer Motion and Lucide React for interface motion and icons

## Security

Verified controls in the repository include:

- Supabase email/password authentication and server-side session handling;
- middleware protection for dashboard routes;
- company context derived from authenticated profiles or active integration keys;
- SHA-256-hashed webhook credentials whose raw value is returned only at creation;
- AES-256-GCM encryption for stored Google OAuth tokens;
- Gmail callback tenant selection derived from the authenticated session rather than OAuth state data;
- bearer authorization for website/API intake;
- optional cron bearer authorization through `CRON_SECRET`;
- external-ID and exact-manual-content idempotency checks;
- deterministic email-or-phone validation before CRM creation; and
- a Content Security Policy response header configured in `next.config.ts`.

For production, set both `ENCRYPTION_KEY` and `CRON_SECRET`. The code contains development fallbacks when these variables are absent, so they should not be omitted in a real deployment. See the schema synchronization warning in [Multi-Tenant Security](#multi-tenant-security).

## Running Locally

### Prerequisites

- A current Node.js LTS release and npm
- A Supabase project
- A Mistral API key
- Google OAuth credentials if Gmail intake will be used

### Setup

```bash
git clone [INSERT GITHUB REPOSITORY URL]
cd LeadLoopAI
npm install
```

Create `.env.local` in the project root and add the variables listed below. Never commit this file.

The repository contains `supabase_setup.sql` as a baseline schema reference. It is not synchronized with all tenant-aware tables, columns, constraints, and relationships used by the current source code. Before running the complete application against a new Supabase project, provide an up-to-date migration defining at least `companies`, `profiles`, `integrations`, `interactions`, `leads`, `tasks`, `review_queue`, `automation_runs`, `automation_steps`, and `notifications`, including the `company_id` fields and relationships referenced in the code.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local Gmail polling, run the application and then start the included worker in another terminal:

```bash
node gmail-worker.mjs
```

## Environment Variables

Core application:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MISTRAL_API_KEY=
NEXT_PUBLIC_BASE_URL=
```

Gmail integration and scheduled synchronization:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ENCRYPTION_KEY=
CRON_SECRET=
```

`NEXT_PUBLIC_BASE_URL` defaults to `http://localhost:3000`. `ENCRYPTION_KEY` currently falls back to the service-role key, and cron authorization is enforced only when `CRON_SECRET` is set; explicit values are strongly recommended outside local development.

## Build

```bash
npm run lint
npm run build
npm run start
```

The current production build passes. The repository-wide lint command currently reports pre-existing errors and warnings that should be resolved before final submission.

## Demo

- **Live Application:** [ADD LIVE URL]
- **Demo Video:** [ADD DEMO VIDEO LINK]
- **Presentation:** [ADD PRESENTATION LINK]

## Business Impact

LeadLoop can help teams respond faster, reduce manual CRM work, prevent missed enquiries, maintain cleaner customer records, ensure follow-up actions are created, and introduce AI into sales operations without removing human oversight.

## Hackathon

**AI BuildFest 2026**

**Participant:** Joseph Harry Soronnadi

**Participant ID:** BF-0330

**Project:** LeadLoop AI
