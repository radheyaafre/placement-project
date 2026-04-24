alter table public.task_questions
add column if not exists source_platform text;

alter table public.task_questions
add column if not exists source_url text;
