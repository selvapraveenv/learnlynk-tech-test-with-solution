# LearnLynk Technical Assessment – Full Solution

This repository contains the complete implementation for the LearnLynk Technical Assessment, including:

  - PostgreSQL Database Schema  
  - Row-Level Security (RLS) Policies  
  - Supabase Edge Function  
  - Next.js Dashboard Page  
  - Stripe Checkout Written Explanation  

The project is structured to be easy to run and easy to review, while maintaining clean engineering practices.

---

## 📁 Project Structure

```sh
backend/
├── schema.sql
├── rls_policies.sql
└── edge-functions/
        └── create-task/
                └── index.ts

frontend/
├── pages/
        └── dashboard/
                └── today.tsx
├── styles/
        └── today.module.css
├── .env.local
└── package.json
```


---

# 🚀 Setup & Execution Guide (Step-by-Step)

This guide explains how to run the project even if you're new to Supabase or Next.js.

---

## 1. Requirements

Install the following before starting:

- **Node.js (LTS version)**
- **Supabase account** → https://supabase.com  
- **Supabase CLI** (recommended)
- **Git**

---

## 2. Clone the Repository

```sh
git clone https://github.com/<your-username>/learnlynk-tech-test-with-solution
cd learnlynk-tech-test-with-solution
```

## 3. Configure Environment Variables

Frontend → frontend/.env.local

```sh
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Backend → Supabase Dashboard → Project Settings → API
Store:

```sh
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

⚠️ Important:
Service role key must NEVER be used in frontend/browser code.

## 4. Set Up Database Schema (Task 1)

Open Supabase Dashboard → SQL Editor.

Paste the content of:

```sh
backend/schema.sql
```
Run it.

This creates the tables:

  - leads
  - applications
  - tasks

With:

  - UUID primary keys
  - Tenant-based constraints
  - Foreign keys
  - Task type validation
  - Date constraints
  - Optimized indexes

## 5. Apply RLS Policies (Task 2)

In Supabase SQL Editor, paste:

```sh
backend/rls_policies.sql
```

Run it.

This enables the required access control rules:

Admins can:
  - View all leads under their tenant

Counselors can:
  - View leads they own
  - View leads assigned to any of their teams

Both Admins and Counselors can insert leads within their tenant.

JWT claims used:
  
  - user_id
  - role
  - tenant_id
  
## 6. Deploy Edge Function (Task 3)

Navigate to:
```sh
backend/edge-functions/create-task
```

Deploy the function:
```sh
supabase functions deploy create-task
```

This function:

  - Validates task_type (call, email, review)
  - Validates due_at (must be future timestamp)
  - Inserts a task using service role key

Returns:

```sh
{ "success": true, "task_id": "<uuid>" }
```

Error handling:

  - 400 → validation error
  - 500 → internal error

## 7. Run the Frontend (Task 4)

```sh
cd frontend
npm install
npm run dev
```

Open:

👉 http://localhost:3001/

The page displays today's due tasks:

  - task type
  - application id
  - due_at
  - status
  - Each task includes a Mark Complete button that updates the task in Supabase.

### Technical Breakdown of Tasks

## Task 1 — Database Schema

Implemented:

  - id, tenant_id, created_at, updated_at

Foreign keys:
  - applications.lead_id → leads.id
  - tasks.application_id → applications.id

tasks.type constraint (call/email/review)

  - due_at >= created_at

Indexes:

  - Leads → tenant_id, owner_id, stage
  - Applications → tenant_id, lead_id
  - Tasks → tenant_id, due_at, status

## Task 2 — Row-Level Security

  - Access Rules
  - Role	Access Description
  - Admin	All leads in tenant
  - Counselor	Leads they own OR are assigned via teams
  - Insert is allowed for both roles within same tenant.

## Task 3 — Edge Function

The function:

  - Accepts JSON input
  - Validates fields
  - Inserts task
  - Returns the new task ID
  - Uses secure service role privileges

## Task 4 — Today Dashboard Page

The frontend page:

  - Fetches tasks due today
  - Displays clean responsive UI
  - Allows changing task status
  - Re-fetches after update

## 💳 Task 5 — Stripe Checkout (Written Explanation)

Stripe Answer:
  - To implement Stripe Checkout for application fees, the system first creates a new payment_requests row when the user begins the payment process. This row contains the user ID, tenant ID, amount, and a status of pending. Next, the backend uses the Stripe secret key to create a Checkout Session, specifying the amount, currency, and success/cancel URLs.
  - Stripe returns a session ID and payment intent ID, which are stored back in the payment_requests table. The user is then redirected to Stripe’s hosted payment page.
  - After the payment is completed, Stripe sends a webhook event to our backend. The webhook endpoint:
  - Verifies the event signature (security)
  - Retrieves the corresponding payment_requests row
  - Updates its status to paid
  - Updates the related application to mark the fee as completed

This ensures the payment flow is secure, verified server-side, and cannot be manipulated from the frontend.
