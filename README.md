LearnLynk Technical Assessment – Full Solution

This repository contains the complete implementation for the LearnLynk Technical Assessment, including:

PostgreSQL database schema

Row-Level Security (RLS) policies

Supabase Edge Function

Next.js dashboard page

Stripe Checkout written explanation

The project is structured to be easy to run and easy to review, even for someone with minimal technical background, while still maintaining strong engineering quality.

📁 Project Structure
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
  ├── styles
        └── today.module.css
  ├── .env.local
  └── package.json

README.md

🚀 Setup & Execution Guide (Step-by-Step)

This guide explains how to run the project from scratch in a simple way.

1. Requirements

Before starting, install:

Node.js (LTS)

Supabase account → https://supabase.com

Supabase CLI (optional but recommended)

Git

2. Clone the Repository
git clone https://github.com/<your-username>/learnlynk-tech-test-with-solution
cd learnlynk-tech-test-with-solution

3. Configure Environment Variables
Frontend → frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

Backend → Supabase Dashboard → Project Settings → API

Store:

SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>


💡 Important:
The service role key must only be used in backend functions—never in the browser.

4. Set Up Database Schema (Task 1)

Open Supabase Dashboard → SQL Editor, paste:

backend/schema.sql


Run it.

This will create:

leads

applications

tasks

with:

UUID primary keys

tenant-based ownership

foreign keys

allowed task types (call, email, review)

constraints (e.g., due_at >= created_at)

indexes for optimized querying

5. Apply RLS Policies (Task 2)

Again in SQL Editor, paste:

backend/rls_policies.sql


Run it.

This enables security rules:

Admins → can read all leads in their tenant

Counselors → can only read

Leads they own

Leads from their teams

Insert allowed for both roles under same tenant

These policies use JWT claims:

user_id

role

tenant_id

6. Deploy the Edge Function (Task 3)

Go to:

backend/edge-functions/create-task


Run:

supabase functions deploy create-task


The function:

Validates task_type

Validates due_at

Inserts task into the database using the service role key

Returns:

{ "success": true, "task_id": "<uuid>" }


Handles:

400 → invalid input

500 → internal server errors

7. Run the Frontend (Task 4)
cd frontend
npm install
npm run dev


Open:

👉 http://localhost:3001/

The page displays today’s tasks including:

type

application_id

due_at

status

and a “Mark Complete” button that directly updates the record in Supabase.

🧩 Task Descriptions (Technical Summary)
Task 1 — Database Schema

Implemented:

Standard audit fields

Foreign keys:

applications.lead_id → leads.id

tasks.application_id → applications.id

Task type constraint

Due date constraint

Indexes:

Leads: tenant_id, owner_id, stage

Applications: tenant_id, lead_id

Tasks: tenant_id, due_at, status

Task 2 — Row-Level Security

RLS rules allow:

Role	Access
Admin	All leads for their tenant
Counselor	Leads they own or leads via teams they belong to

Insert allowed only within same tenant.

Task 3 — Edge Function

The function:

Accepts JSON input

Validates content

Inserts task

Returns task ID

Ensures secure server-side creation using service role privileges.

Task 4 — Frontend Today Dashboard

The UI:

Fetches tasks due today

Renders list

Allows completing tasks

Updates Supabase directly

Re-renders after update

Simple, clean, and functional.

💳 Task 5 — Stripe Checkout (Written Answer)
Stripe Answer

To implement Stripe Checkout for application fees, I would begin by inserting a payment_requests row when the user initiates the payment flow. This row stores the user ID, tenant ID, amount, and status set to “pending”. After this, the backend calls the Stripe API to create a Checkout Session using the server secret key. The session ID and payment intent ID returned by Stripe are saved back into the payment_requests table.

The user is then redirected to the Stripe checkout page. Once the payment is completed, Stripe sends a webhook event to our backend. This webhook endpoint verifies the event signature for security, loads the corresponding payment request, and updates its status to “paid”. At the same time, the related application record is updated to reflect that the fee has been successfully processed. This ensures the payment flow is fully secure, verified, and cannot be manipulated from the frontend.
