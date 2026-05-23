-- =============================================
-- Complete AI Agent — Supabase Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- Employees
create table if not exists employees (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text unique not null,
  job_role    text,
  department  text,
  status      text default 'active',
  created_at  timestamptz default now()
);

-- Email logs
create table if not exists email_logs (
  id          uuid primary key default gen_random_uuid(),
  to_email    text not null,
  subject     text,
  body        text,
  status      text default 'sent',
  created_at  timestamptz default now()
);

-- Call logs
create table if not exists call_logs (
  id            uuid primary key default gen_random_uuid(),
  call_sid      text,
  caller_number text,
  caller_speech text,
  ai_response   text,
  duration_sec  int,
  status        text default 'completed',
  created_at    timestamptz default now()
);

-- Post logs (LinkedIn / social)
create table if not exists post_logs (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  content     text,
  goal        text,
  image_url   text,
  channels    jsonb,
  status      text default 'draft',
  impressions int default 0,
  created_at  timestamptz default now()
);

-- Resumes (ATS)
create table if not exists resumes (
  id          uuid primary key default gen_random_uuid(),
  filename    text not null,
  job_role    text,
  score       int,
  verdict     text,
  summary     text,
  skills      text[],
  gaps        text[],
  created_at  timestamptz default now()
);

-- Interview sessions
create table if not exists interview_sessions (
  id                 uuid primary key default gen_random_uuid(),
  candidate_id       uuid references employees(id) on delete set null,
  candidate_name     text,
  job_role           text,
  status             text default 'pending',
  final_score        numeric(4,2),
  summary            text,
  disqualify_reason  text,
  created_at         timestamptz default now()
);

-- Attendance
create table if not exists attendance (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid references employees(id) on delete cascade,
  employee_name text,
  date          date not null,
  check_in      timestamptz,
  check_out     timestamptz,
  hours_worked  numeric(5,2),
  method        text default 'manual',
  location      text,
  is_wfh        boolean default false,
  status        text default 'present',
  created_at    timestamptz default now(),
  unique(employee_id, date)
);

-- Leave requests
create table if not exists leave_requests (
  id                 uuid primary key default gen_random_uuid(),
  employee_id        uuid references employees(id) on delete cascade,
  employee_name      text,
  type               text not null,
  start_date         date not null,
  end_date           date not null,
  days               int,
  reason             text,
  status             text default 'pending',
  ai_recommendation  text,
  ai_note            text,
  approved_by        text,
  rejection_reason   text,
  created_at         timestamptz default now()
);

-- Enable Row Level Security (adjust policies as needed)
alter table employees          enable row level security;
alter table email_logs         enable row level security;
alter table call_logs          enable row level security;
alter table post_logs          enable row level security;
alter table resumes            enable row level security;
alter table interview_sessions enable row level security;
alter table attendance         enable row level security;
alter table leave_requests     enable row level security;

-- Allow service role full access (used by backend)
create policy "service_role_all" on employees          for all using (true);
create policy "service_role_all" on email_logs         for all using (true);
create policy "service_role_all" on call_logs          for all using (true);
create policy "service_role_all" on post_logs          for all using (true);
create policy "service_role_all" on resumes            for all using (true);
create policy "service_role_all" on interview_sessions for all using (true);
create policy "service_role_all" on attendance         for all using (true);
create policy "service_role_all" on leave_requests     for all using (true);
