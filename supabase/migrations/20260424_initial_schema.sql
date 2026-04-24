create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  college_name text not null default '',
  target_role text not null default 'Software Engineer',
  timezone text not null default 'Asia/Kolkata',
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.plan_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  duration_days integer not null default 90 check (duration_days > 0),
  is_active boolean not null default false,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_template_id uuid not null references public.plan_templates(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  week_number integer not null check (week_number > 0),
  theme text not null check (theme in ('aptitude', 'dsa', 'sql', 'hr', 'revision')),
  title text not null,
  motivation_copy text not null default '',
  estimated_minutes integer not null default 60 check (estimated_minutes > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (plan_template_id, day_number)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references public.plan_days(id) on delete cascade,
  task_type text not null check (task_type in ('aptitude', 'dsa', 'sql', 'hr', 'revision')),
  title text not null,
  topic text not null default '',
  instructions_md text not null default '',
  solution_md text not null default '',
  estimated_minutes integer not null default 60 check (estimated_minutes > 0),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (plan_day_id)
);

create table if not exists public.task_questions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  position integer not null check (position > 0),
  prompt_md text not null,
  question_type text not null check (question_type in ('mcq', 'short_text', 'long_text')),
  explanation_md text not null default '',
  sample_answer_md text not null default '',
  correct_text_answer text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (task_id, position)
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  task_question_id uuid not null references public.task_questions(id) on delete cascade,
  position integer not null check (position > 0),
  option_text text not null,
  is_correct boolean not null default false,
  unique (task_question_id, position)
);

create table if not exists public.student_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_template_id uuid not null references public.plan_templates(id) on delete restrict,
  start_date date not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  target_minutes_per_day integer not null default 60 check (target_minutes_per_day > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists student_plans_one_active_per_user
on public.student_plans(user_id)
where status = 'active';

create table if not exists public.user_task_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  plan_day_id uuid references public.plan_days(id) on delete set null,
  status text not null default 'available' check (status in ('available', 'attempted', 'solution_unlocked', 'completed')),
  score numeric,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  first_opened_at timestamptz,
  first_attempt_at timestamptz,
  solution_unlocked_at timestamptz,
  completed_at timestamptz,
  self_confidence_rating integer check (self_confidence_rating between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, task_id)
);

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_task_progress_id uuid not null references public.user_task_progress(id) on delete cascade,
  task_question_id uuid not null references public.task_questions(id) on delete cascade,
  attempt_no integer not null default 1,
  selected_option_id uuid references public.question_options(id) on delete set null,
  answer_text text,
  is_correct boolean,
  submitted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reminder_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  weekly_reminder_enabled boolean not null default true,
  weekly_reminder_day integer not null default 0 check (weekly_reminder_day between 0 and 6),
  weekly_reminder_hour integer not null default 19 check (weekly_reminder_hour between 0 and 23),
  timezone text not null default 'Asia/Kolkata',
  last_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists plan_days_template_day_idx
  on public.plan_days(plan_template_id, day_number);

create index if not exists tasks_plan_day_idx
  on public.tasks(plan_day_id);

create index if not exists user_task_progress_user_completed_idx
  on public.user_task_progress(user_id, completed_at desc nulls last);

create index if not exists user_task_progress_user_status_idx
  on public.user_task_progress(user_id, status);

create index if not exists question_attempts_user_submitted_idx
  on public.question_attempts(user_id, submitted_at desc);

create index if not exists student_plans_user_status_idx
  on public.student_plans(user_id, status);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists plan_templates_set_updated_at on public.plan_templates;
create trigger plan_templates_set_updated_at
before update on public.plan_templates
for each row execute procedure public.set_updated_at();

drop trigger if exists plan_days_set_updated_at on public.plan_days;
create trigger plan_days_set_updated_at
before update on public.plan_days
for each row execute procedure public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute procedure public.set_updated_at();

drop trigger if exists student_plans_set_updated_at on public.student_plans;
create trigger student_plans_set_updated_at
before update on public.student_plans
for each row execute procedure public.set_updated_at();

drop trigger if exists user_task_progress_set_updated_at on public.user_task_progress;
create trigger user_task_progress_set_updated_at
before update on public.user_task_progress
for each row execute procedure public.set_updated_at();

drop trigger if exists reminder_preferences_set_updated_at on public.reminder_preferences;
create trigger reminder_preferences_set_updated_at
before update on public.reminder_preferences
for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, timezone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'timezone', 'Asia/Kolkata'),
    'student'
  )
  on conflict (user_id) do nothing;

  insert into public.reminder_preferences (user_id, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'timezone', 'Asia/Kolkata')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.plan_templates enable row level security;
alter table public.plan_days enable row level security;
alter table public.tasks enable row level security;
alter table public.task_questions enable row level security;
alter table public.question_options enable row level security;
alter table public.student_plans enable row level security;
alter table public.user_task_progress enable row level security;
alter table public.question_attempts enable row level security;
alter table public.reminder_preferences enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "plan_templates_select_authenticated" on public.plan_templates;
create policy "plan_templates_select_authenticated"
on public.plan_templates
for select
to authenticated
using (true);

drop policy if exists "plan_templates_admin_manage" on public.plan_templates;
create policy "plan_templates_admin_manage"
on public.plan_templates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "plan_days_select_authenticated" on public.plan_days;
create policy "plan_days_select_authenticated"
on public.plan_days
for select
to authenticated
using (true);

drop policy if exists "plan_days_admin_manage" on public.plan_days;
create policy "plan_days_admin_manage"
on public.plan_days
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tasks_select_authenticated" on public.tasks;
create policy "tasks_select_authenticated"
on public.tasks
for select
to authenticated
using (true);

drop policy if exists "tasks_admin_manage" on public.tasks;
create policy "tasks_admin_manage"
on public.tasks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "task_questions_select_authenticated" on public.task_questions;
create policy "task_questions_select_authenticated"
on public.task_questions
for select
to authenticated
using (true);

drop policy if exists "task_questions_admin_manage" on public.task_questions;
create policy "task_questions_admin_manage"
on public.task_questions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "question_options_select_authenticated" on public.question_options;
create policy "question_options_select_authenticated"
on public.question_options
for select
to authenticated
using (true);

drop policy if exists "question_options_admin_manage" on public.question_options;
create policy "question_options_admin_manage"
on public.question_options
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "student_plans_select_own_or_admin" on public.student_plans;
create policy "student_plans_select_own_or_admin"
on public.student_plans
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "student_plans_insert_own_or_admin" on public.student_plans;
create policy "student_plans_insert_own_or_admin"
on public.student_plans
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "student_plans_update_own_or_admin" on public.student_plans;
create policy "student_plans_update_own_or_admin"
on public.student_plans
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_task_progress_select_own_or_admin" on public.user_task_progress;
create policy "user_task_progress_select_own_or_admin"
on public.user_task_progress
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_task_progress_insert_own_or_admin" on public.user_task_progress;
create policy "user_task_progress_insert_own_or_admin"
on public.user_task_progress
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_task_progress_update_own_or_admin" on public.user_task_progress;
create policy "user_task_progress_update_own_or_admin"
on public.user_task_progress
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "question_attempts_select_own_or_admin" on public.question_attempts;
create policy "question_attempts_select_own_or_admin"
on public.question_attempts
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "question_attempts_insert_own_or_admin" on public.question_attempts;
create policy "question_attempts_insert_own_or_admin"
on public.question_attempts
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "reminder_preferences_select_own_or_admin" on public.reminder_preferences;
create policy "reminder_preferences_select_own_or_admin"
on public.reminder_preferences
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "reminder_preferences_insert_own_or_admin" on public.reminder_preferences;
create policy "reminder_preferences_insert_own_or_admin"
on public.reminder_preferences
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "reminder_preferences_update_own_or_admin" on public.reminder_preferences;
create policy "reminder_preferences_update_own_or_admin"
on public.reminder_preferences
for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());
