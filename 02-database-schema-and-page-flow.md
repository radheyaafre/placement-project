# Database Schema and Page Flow

## 1. Design Principles

- Keep the database simple enough to ship quickly.
- Separate content templates from student progress.
- Support one plan with 90 days, but allow future versioning.
- Use derived scheduling based on student start date instead of pre-creating many rows.
- Let aptitude be auto-scored while DSA, SQL, and HR remain self-reviewed in MVP.

## 2. Core Entities

The MVP needs two major layers:

1. Content layer
   - the master 90-day plan
   - day definitions
   - tasks
   - questions and solutions
2. Student layer
   - user profile
   - enrolled plan
   - task progress
   - answer attempts
   - reminder preferences

## 3. Authentication Source

Use `supabase auth.users` for authentication.

Application-specific data lives in `public.*` tables and links back to `auth.users.id`.

## 4. Suggested Tables

### 4.1 `profiles`

Purpose: stores application profile data for each authenticated user.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid pk` | references `auth.users.id` |
| `full_name` | `text` | required after onboarding |
| `college_name` | `text` | optional |
| `target_role` | `text` | example: software engineer, analyst |
| `timezone` | `text` | default from browser |
| `role` | `text` | `student` or `admin` |
| `created_at` | `timestamptz` | default now |
| `updated_at` | `timestamptz` | default now |

### 4.2 `plan_templates`

Purpose: versioned master plan definition.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid pk` | generated |
| `name` | `text` | example: Placement Sprint v1 |
| `slug` | `text unique` | human-readable identifier |
| `duration_days` | `int` | default `90` |
| `is_active` | `boolean` | current live plan |
| `created_by` | `uuid` | admin user id |
| `created_at` | `timestamptz` | default now |
| `updated_at` | `timestamptz` | default now |

### 4.3 `plan_days`

Purpose: one row per day in the plan.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid pk` | generated |
| `plan_template_id` | `uuid` | references `plan_templates.id` |
| `day_number` | `int` | 1 to 90 |
| `week_number` | `int` | derived during import for easier grouping |
| `theme` | `text` | aptitude, dsa, sql, hr, revision |
| `title` | `text` | day title shown in UI |
| `motivation_copy` | `text` | supportive line for that day |
| `estimated_minutes` | `int` | usually 45 to 60 |
| `is_published` | `boolean` | visible to students only when true |
| `created_at` | `timestamptz` | default now |
| `updated_at` | `timestamptz` | default now |

Unique constraint:

- `unique(plan_template_id, day_number)`

### 4.4 `tasks`

Purpose: task payload for a plan day.

For MVP, assume one primary task per day. This still uses a `tasks` table so later versions can support multiple tasks per day without redesign.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid pk` | generated |
| `plan_day_id` | `uuid` | references `plan_days.id` |
| `task_type` | `text` | `aptitude`, `dsa`, `sql`, `hr`, `revision` |
| `title` | `text` | task title |
| `topic` | `text` | percentages, arrays, joins, self-intro |
| `instructions_md` | `text` | markdown instructions |
| `solution_md` | `text` | markdown solution or answer guide |
| `estimated_minutes` | `int` | fallback if different from day |
| `difficulty` | `text` | easy, medium, hard |
| `is_active` | `boolean` | soft publish flag |
| `created_at` | `timestamptz` | default now |
| `updated_at` | `timestamptz` | default now |

### 4.5 `task_questions`

Purpose: child questions inside a task.

This table supports:

- 10 aptitude MCQs in one daily task
- a single DSA question
- a single SQL prompt
- 3 HR prompts in one task

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid pk` | generated |
| `task_id` | `uuid` | references `tasks.id` |
| `position` | `int` | order within the task |
| `prompt_md` | `text` | question text |
| `question_type` | `text` | `mcq`, `long_text`, `short_text` |
| `explanation_md` | `text` | optional per-question explanation |
| `sample_answer_md` | `text` | useful for DSA, SQL, HR |
| `correct_text_answer` | `text` | optional, only for simple use cases |
| `created_at` | `timestamptz` | default now |

### 4.6 `question_options`

Purpose: options for MCQ aptitude questions.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid pk` | generated |
| `task_question_id` | `uuid` | references `task_questions.id` |
| `position` | `int` | A, B, C, D order |
| `option_text` | `text` | displayed answer option |
| `is_correct` | `boolean` | true for correct option |

### 4.7 `student_plans`

Purpose: enrollment record linking a student to a plan.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid pk` | generated |
| `user_id` | `uuid` | references `auth.users.id` |
| `plan_template_id` | `uuid` | references `plan_templates.id` |
| `start_date` | `date` | Day 1 for that student |
| `status` | `text` | `active`, `paused`, `completed` |
| `target_minutes_per_day` | `int` | default 60 |
| `created_at` | `timestamptz` | default now |
| `updated_at` | `timestamptz` | default now |

Recommended constraint:

- one active student plan per user

### 4.8 `user_task_progress`

Purpose: one row per student per task to store status and completion data.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid pk` | generated |
| `user_id` | `uuid` | references `auth.users.id` |
| `task_id` | `uuid` | references `tasks.id` |
| `plan_day_id` | `uuid` | denormalized for easier reporting |
| `status` | `text` | `available`, `attempted`, `solution_unlocked`, `completed` |
| `score` | `numeric` | aptitude score percent or null |
| `attempt_count` | `int` | default 0 |
| `first_opened_at` | `timestamptz` | first page visit |
| `first_attempt_at` | `timestamptz` | first submit |
| `solution_unlocked_at` | `timestamptz` | when solution became visible |
| `completed_at` | `timestamptz` | final completion |
| `self_confidence_rating` | `int` | optional 1 to 5 self-rating |
| `created_at` | `timestamptz` | default now |
| `updated_at` | `timestamptz` | default now |

Unique constraint:

- `unique(user_id, task_id)`

### 4.9 `question_attempts`

Purpose: stores submitted answers at question level.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid pk` | generated |
| `user_id` | `uuid` | references `auth.users.id` |
| `user_task_progress_id` | `uuid` | references `user_task_progress.id` |
| `task_question_id` | `uuid` | references `task_questions.id` |
| `attempt_no` | `int` | 1, 2, 3 |
| `selected_option_id` | `uuid` | for MCQ answers |
| `answer_text` | `text` | for DSA, SQL, HR |
| `is_correct` | `boolean` | only reliable for MCQ in MVP |
| `submitted_at` | `timestamptz` | default now |

### 4.10 `reminder_preferences`

Purpose: stores reminder settings for each student.

| Column | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid pk` | references `auth.users.id` |
| `email_enabled` | `boolean` | default true |
| `weekly_reminder_enabled` | `boolean` | default true |
| `weekly_reminder_day` | `int` | example `0` for Sunday |
| `weekly_reminder_hour` | `int` | local hour in user timezone |
| `timezone` | `text` | duplicate for job simplicity |
| `last_sent_at` | `timestamptz` | for throttling |
| `created_at` | `timestamptz` | default now |
| `updated_at` | `timestamptz` | default now |

## 5. Optional Table for Later

Not required for launch, but useful later:

- `weekly_checkins`
- `badges`
- `notification_log`
- `content_import_jobs`

## 6. Key Relationships

- `profiles.user_id -> auth.users.id`
- `student_plans.user_id -> auth.users.id`
- `student_plans.plan_template_id -> plan_templates.id`
- `plan_days.plan_template_id -> plan_templates.id`
- `tasks.plan_day_id -> plan_days.id`
- `task_questions.task_id -> tasks.id`
- `question_options.task_question_id -> task_questions.id`
- `user_task_progress.user_id -> auth.users.id`
- `user_task_progress.task_id -> tasks.id`
- `question_attempts.user_task_progress_id -> user_task_progress.id`
- `question_attempts.task_question_id -> task_questions.id`
- `reminder_preferences.user_id -> auth.users.id`

## 7. Status Model

Per student, a task moves through this order:

`available -> attempted -> solution_unlocked -> completed`

Derived states:

- `locked` is not stored in `user_task_progress`; it is computed from date
- `missed` is not stored; it is computed in the UI if the date passed and completion did not happen

## 8. Scheduling Logic

Do not create 90 dated rows for every student on signup.

Instead:

- store `start_date` in `student_plans`
- calculate the active day using the difference between today and `start_date`
- map that value to `plan_days.day_number`

Example:

- if `start_date = 2026-05-01`
- and today is `2026-05-10`
- current plan day = `10`

This keeps the schema light and easy to reason about.

## 9. Index Recommendations

- index `plan_days(plan_template_id, day_number)`
- index `tasks(plan_day_id)`
- index `user_task_progress(user_id, completed_at desc)`
- index `user_task_progress(user_id, status)`
- index `question_attempts(user_id, submitted_at desc)`
- index `student_plans(user_id, status)`

## 10. Row Level Security Summary

### Students

- can read published content from active plans
- can read and update only their own profile
- can read and update only their own progress rows
- can insert only their own attempts
- can read and update only their own reminder preferences

### Admins

- can create and update content tables
- can view reporting summaries
- can manage plan publishing

### Service Role

- used only by server-side jobs such as reminder sending and admin imports

## 11. Suggested Routes

| Route | Purpose |
| --- | --- |
| `/` | landing and product intro |
| `/login` | student login |
| `/signup` | student registration |
| `/onboarding` | capture profile, timezone, reminder settings |
| `/dashboard` | show today's mission, streak, and overall progress |
| `/mission/[taskId]` | attempt and complete the daily mission |
| `/progress` | week-wise and total progress |
| `/settings` | profile and reminder settings |
| `/admin/content` | upload and manage plan content |
| `/admin/plan/[planId]` | inspect plan days and publishing status |

## 12. Page Flow

### 12.1 New Student Flow

1. Open landing page.
2. Click `Get Started`.
3. Create account on `/signup`.
4. Land on `/onboarding`.
5. Submit profile and reminder settings.
6. System creates:
   - `profiles` row
   - `student_plans` row
   - `reminder_preferences` row
7. Redirect to `/dashboard`.

### 12.2 Daily Mission Flow

1. Student opens `/dashboard`.
2. App calculates the current day from `student_plans.start_date`.
3. App finds the matching published `plan_days` and `tasks`.
4. Student opens `/mission/[taskId]`.
5. System loads:
   - task details
   - child questions
   - saved progress if any
6. Student submits answers.
7. System writes:
   - `user_task_progress`
   - `question_attempts`
8. If aptitude:
   - auto-score selected answers
   - show explanations
9. If DSA, SQL, or HR:
   - mark as attempted
   - reveal sample answer or solution
10. Student clicks `Mark Complete`.
11. System sets `completed_at` and `status = completed`.
12. Dashboard reflects new streak and completion counts.

### 12.3 Missed Task Flow

1. Student opens dashboard after missing previous days.
2. App shows:
   - today's mission
   - incomplete past missions
3. Student can open an old mission and complete it.
4. Missed tasks should not block access to today's mission in MVP.

### 12.4 Weekly Reminder Flow

1. Scheduled job runs daily.
2. Job checks each student's timezone and reminder preference.
3. If the current local day and hour match the reminder rule:
   - build a summary of completed and pending missions
   - send a reminder email
4. Update `reminder_preferences.last_sent_at` or a future notification log table.

### 12.5 Admin Content Import Flow

1. Admin opens `/admin/content`.
2. Admin uploads CSV.
3. Backend validates row structure.
4. System upserts:
   - `plan_templates`
   - `plan_days`
   - `tasks`
   - `task_questions`
   - `question_options`
5. Admin previews and publishes the plan.

## 13. Screen-Level Data Requirements

### Dashboard

Needs:

- current student profile
- active student plan
- today's task summary
- counts for completed, pending, streak
- recent activity summary

### Mission Page

Needs:

- task metadata
- list of questions
- saved answers if in progress
- whether solution is unlocked
- whether completion is already recorded

### Progress Page

Needs:

- total completed missions
- week-wise completion breakdown
- category breakdown by task type

### Settings Page

Needs:

- editable profile
- reminder preferences

### Admin Content Page

Needs:

- active plan version
- upload status
- validation errors
- publish toggle

## 14. Recommended First Migration Order

1. `profiles`
2. `plan_templates`
3. `plan_days`
4. `tasks`
5. `task_questions`
6. `question_options`
7. `student_plans`
8. `user_task_progress`
9. `question_attempts`
10. `reminder_preferences`

## 15. Recommendation

This schema is intentionally simple, but it is strong enough for:

- one active 90-day prep plan
- a daily attempt and review loop
- basic analytics
- a clean upgrade path for richer features later

It is the right level of complexity for an MVP launch.
