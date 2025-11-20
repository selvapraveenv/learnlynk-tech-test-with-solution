**LearnLynk – Technical Test
**
Thanks for taking the time to do this.
This is meant to show how you think and how you approach real work.
It’s intentionally small and should take about 2–3 hours. It’s okay if you don’t complete everything — leave comments where appropriate.
We use:
•	Supabase Postgres
•	Supabase Edge Functions (TypeScript)
•	Next.js + TypeScript
Use your own Supabase project (free tier is fine).


Overview of Tasks
There are four parts:
1.	Database schema – backend/schema.sql
2.	RLS policies – backend/rls_policies.sql
3.	Edge Function – backend/edge-functions/create-task/index.ts
4.	Simple frontend page – frontend/pages/dashboard/today.tsx
There’s also a short written question about Stripe at the end.
You can reference Supabase docs, PostgreSQL docs, etc. No need to memorize anything.


**Task 1 – Database Schema
**File: backend/schema.sql
Create three tables:
•	leads
•	applications
•	tasks

All tables should have these columns (common pattern in our system):
id uuid primary key default gen_random_uuid(),
tenant_id uuid not null,
created_at timestamptz default now(),
updated_at timestamptz default now()

Extra requirements:

•	applications.lead_id → FK to leads.id
•	tasks.application_id → FK to applications.id
•	tasks.type ∈ ('call', 'email', 'review')
•	tasks.due_at >= tasks.created_at
•	Add reasonable indexes for typical queries (tenant_id filters, due tasks, etc.)

Use your own judgment on anything else you’d normally add.


**Task 2 – RLS Policy for Leads
**
File: backend/rls_policies.sql

Scenario:
•	Counselors should only see leads they own OR that belong to their team.
•	Admins can see everything for their tenant.

Assume these tables exist:
users(id, tenant_id, role)
teams(id, tenant_id)
user_teams(user_id, team_id)

JWT includes:
•	user_id
•	role
•	tenant_id

What to do:
•	Turn on RLS for leads
•	Add a SELECT policy enforcing the above rules
•	Add an INSERT policy that allows counselors/admins to insert leads under their tenant

(You can assume tenant_id is validated through the JWT.)
Write realistic SQL — doesn’t need to be perfect.


**Task 3 – Edge Function: create-task
**
File: backend/edge-functions/create-task/index.ts

Function should:
•	Accept POST body:
{
  "application_id": "uuid",
  "task_type": "call",
  "due_at": "2025-01-01T12:00:00Z"
}

•	Validate:
o	task_type in allowed values
o	due_at is a valid future timestamp
•	Insert into tasks using service role key

•	Return:
{ "success": true, "task_id": "..."}

•	Use appropriate error codes (400 for bad input, 500 for server errors)
You don’t need to write perfect production code — just clean and correct.

**Task 4 – Frontend Page (/dashboard/today)
**
File: frontend/pages/dashboard/today.tsx

Build a simple page that:
•	Fetches tasks due today (status != completed)
•	Shows a table: type, application_id, due_at, status
•	Allows marking a task as “completed”
•	Updates the UI afterwards

Use any approach you prefer (React hooks, SWR, etc.). Keep it simple.

**Task 5 – Short Answer: Stripe Checkout (8–12 lines)
**
At the bottom of this README, add a section:
## Stripe Answer

Describe — in plain English — how you would:
•	Insert a payment_requests row
•	Create a Checkout session
•	Store the session_id
•	Handle Stripe webhooks
•	Update payment + application status on success

No need for code — just your approach.

Submitting
1.	Put your work in a public GitHub repo
2.	Include your Stripe answer at the bottom of this README
3.	Send us the link
   
Don’t worry about being perfect. We’re looking at how you structure things and how you think about the problem.

