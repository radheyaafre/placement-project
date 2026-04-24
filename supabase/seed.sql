insert into public.plan_templates (name, slug, duration_days, is_active)
values ('Placement Sprint v1', 'placement-sprint-v1', 90, true)
on conflict (slug) do update
set
  name = excluded.name,
  duration_days = excluded.duration_days,
  is_active = excluded.is_active;

insert into public.plan_days (
  plan_template_id,
  day_number,
  week_number,
  theme,
  title,
  motivation_copy,
  estimated_minutes,
  is_published
)
select
  pt.id,
  seed.day_number,
  seed.week_number,
  seed.theme,
  seed.title,
  seed.motivation_copy,
  seed.estimated_minutes,
  true
from public.plan_templates pt
cross join (
  values
    (1, 1, 'aptitude', 'Percentages Warm-Up', 'Strong placement prep starts with one disciplined hour.', 60),
    (2, 1, 'aptitude', 'Speed and Time Sprint', 'Consistency beats intensity when the plan is clear.', 60),
    (3, 1, 'dsa', 'Array Patterns: Two Sum', 'One well-understood pattern today saves panic later.', 60),
    (4, 1, 'sql', 'Second Highest Salary', 'Small daily reps make technical interviews feel familiar.', 50),
    (5, 1, 'aptitude', 'Logical Reasoning: Seating and Patterns', 'Momentum is built in ordinary days like this one.', 60),
    (6, 1, 'hr', 'HR Reflection Lab', 'Placement success is also about clarity, not only coding.', 45),
    (7, 1, 'revision', 'Weekly Review and Reset', 'Reflection turns busy work into progress.', 40)
) as seed(day_number, week_number, theme, title, motivation_copy, estimated_minutes)
where pt.slug = 'placement-sprint-v1'
on conflict (plan_template_id, day_number) do update
set
  week_number = excluded.week_number,
  theme = excluded.theme,
  title = excluded.title,
  motivation_copy = excluded.motivation_copy,
  estimated_minutes = excluded.estimated_minutes,
  is_published = excluded.is_published;

insert into public.tasks (
  plan_day_id,
  task_type,
  title,
  topic,
  instructions_md,
  solution_md,
  estimated_minutes,
  difficulty,
  is_active
)
select
  pd.id,
  task_seed.task_type,
  task_seed.title,
  task_seed.topic,
  task_seed.instructions_md,
  task_seed.solution_md,
  task_seed.estimated_minutes,
  task_seed.difficulty,
  true
from public.plan_days pd
join public.plan_templates pt on pt.id = pd.plan_template_id
join (
  values
    (1, 'aptitude', 'Percentages Warm-Up', 'Percentages and ratio', 'Answer all ten questions before looking at the explanations.
Use rough paper for calculations and note where you lost time.', 'Review both arithmetic and the shortcut pattern after attempting the set.
Track whether your mistakes came from concept confusion or calculation speed.', 60, 'easy'),
    (2, 'aptitude', 'Speed and Time Sprint', 'Time, speed, distance', 'Solve all ten questions without a calculator.
Try to write the governing formula before each answer.', 'This set is about choosing the correct formula before substituting numbers.
When average speed is involved, use total distance divided by total time.', 60, 'medium'),
    (3, 'dsa', 'Array Patterns: Two Sum', 'Hashing and arrays', 'Write the brute-force idea first, then the optimized idea.
Mention time and space complexity in your own words.', 'Use a hash map to store numbers seen so far and the index where each appeared.
For each number, compute target minus current. If the complement already exists in the map, return the stored index and current index.
This solves the problem in O(n) time with O(n) extra space.', 60, 'easy'),
    (4, 'sql', 'Second Highest Salary', 'SQL ranking and aggregation', 'Attempt the query first from memory.
If you know two approaches, write both.', 'A simple approach is to use a subquery with MAX on salaries lower than the overall maximum.
A ranking approach uses DENSE_RANK over salary descending and selects rank 2.
Mention null handling if there is no second highest value.', 50, 'medium'),
    (5, 'aptitude', 'Logical Reasoning: Seating and Patterns', 'Reasoning', 'Read all ten questions carefully before choosing an answer.
Draw the arrangement rather than solving in your head.', 'Reasoning improves fastest when you convert words into structure.
Use tables, circles, and elimination patterns instead of mental juggling.', 60, 'medium'),
    (6, 'hr', 'HR Reflection Lab', 'Behavioral interview readiness', 'Answer in bullet points first.
Use a brief STAR structure where possible.', 'For HR answers, structure matters more than sounding perfect.
Use context, your action, and the outcome instead of long stories.
Keep answers specific and anchored in real examples.', 45, 'easy'),
    (7, 'revision', 'Weekly Review and Reset', 'Reflection and backlog control', 'Look back honestly at what you completed and what slipped.
Write one practical improvement for next week.', 'A strong weekly reset does three things: acknowledge wins, identify friction, and set one small correction.
Do not create a huge catch-up list. Pick the next actions that keep you moving.', 40, 'easy')
) as task_seed(day_number, task_type, title, topic, instructions_md, solution_md, estimated_minutes, difficulty)
  on task_seed.day_number = pd.day_number
where pt.slug = 'placement-sprint-v1'
on conflict (plan_day_id) do update
set
  task_type = excluded.task_type,
  title = excluded.title,
  topic = excluded.topic,
  instructions_md = excluded.instructions_md,
  solution_md = excluded.solution_md,
  estimated_minutes = excluded.estimated_minutes,
  difficulty = excluded.difficulty,
  is_active = excluded.is_active;

insert into public.task_questions (
  task_id,
  position,
  prompt_md,
  question_type,
  explanation_md,
  sample_answer_md
)
select
  t.id,
  seed.position,
  seed.prompt_md,
  seed.question_type,
  seed.explanation_md,
  seed.sample_answer_md
from public.tasks t
join public.plan_days pd on pd.id = t.plan_day_id
join public.plan_templates pt on pt.id = pd.plan_template_id
join (
  values
    (1, 1, 'What is 25% of 480?', 'mcq', '25% is one-fourth, so divide 480 by 4.', ''),
    (1, 2, 'A number increases from 80 to 92. What is the percentage increase?', 'mcq', 'Increase is 12 on a base of 80, so 12/80 x 100.', ''),
    (1, 3, 'If 40% of a number is 72, what is the number?', 'mcq', 'Number = 72 / 0.4.', ''),
    (1, 4, 'Price of a book falls from 500 to 425. What is the percentage decrease?', 'mcq', 'Decrease is 75 on a base of 500.', ''),
    (1, 5, 'A salary is raised by 10% and then reduced by 10%. Net change is:', 'mcq', 'Successive +10% and -10% lead to a 1% net decrease.', ''),
    (1, 6, 'What is 35% of 640?', 'mcq', '10% of 640 is 64, so 30% is 192 and 5% is 32.', ''),
    (1, 7, 'A price rises from 250 to 300. What is the percentage increase?', 'mcq', 'Increase is 50 on the original base of 250, so 50/250 x 100.', ''),
    (1, 8, 'If a number is decreased by 25% and becomes 90, the original number is:', 'mcq', 'After a 25% decrease, 75% of the number remains, so x = 90 / 0.75.', ''),
    (1, 9, 'In a class, 60% of the students are boys and there are 48 boys. Total students are:', 'mcq', 'If 60% corresponds to 48, divide 48 by 0.6.', ''),
    (1, 10, 'After a 20% discount, an item costs 960. The marked price was:', 'mcq', 'A 20% discount means the sale price is 80% of the marked price.', ''),
    (2, 1, 'A car covers 180 km in 3 hours. Its speed is:', 'mcq', 'Speed equals distance divided by time.', ''),
    (2, 2, 'A train running at 72 km/h covers 240 m in how many seconds?', 'mcq', '72 km/h is 20 m/s, so time is 240 divided by 20.', ''),
    (2, 3, 'If speed doubles, time to travel the same distance becomes:', 'mcq', 'Time is inversely proportional to speed for a fixed distance.', ''),
    (2, 4, 'A person walks at 6 km/h instead of 5 km/h and reaches 10 minutes early. Distance is:', 'mcq', 'Use D/5 minus D/6 equals 10/60 for the same distance.', ''),
    (2, 5, 'An athlete runs the first half of a race at 8 km/h and the second half at 12 km/h. Average speed is:', 'mcq', 'For equal distances, average speed is 2ab divided by a plus b.', ''),
    (2, 6, 'A biker covers 150 km at 50 km/h. Time taken is:', 'mcq', 'Time equals distance divided by speed: 150 divided by 50.', ''),
    (2, 7, '54 km/h is equal to:', 'mcq', 'To convert km/h to m/s, multiply by 5/18.', ''),
    (2, 8, 'A 120 m train crosses a pole in 6 seconds. Its speed is:', 'mcq', '120 divided by 6 gives 20 m/s, which is 72 km/h.', ''),
    (2, 9, 'A car moving at 40 km/h reaches 15 minutes late, but at 50 km/h it arrives on time. Distance is:', 'mcq', 'Use D/40 minus D/50 equals 15/60.', ''),
    (2, 10, 'A bus travels 120 km at 40 km/h and the next 120 km at 60 km/h. Average speed for the whole trip is:', 'mcq', 'Total distance is 240 km and total time is 3 plus 2 equals 5 hours.', ''),
    (3, 1, 'Given an array of integers and a target, return the indices of the two numbers whose sum equals the target. Write your approach and sample code or pseudocode.', 'long_text', '', 'Use a hash map to store seen values and check complements as you iterate.'),
    (4, 1, 'Write an SQL query to find the second highest salary from an Employee table with columns employee_id, name, and salary.', 'long_text', '', 'A subquery with MAX or DENSE_RANK both work well here.'),
    (5, 1, 'Which number comes next in the series: 3, 6, 11, 18, 27, ?', 'mcq', 'Differences are 3, 5, 7, 9, so the next difference is 11.', ''),
    (5, 2, 'Five students sit in a row. If A is to the immediate left of B, and C is at one end, which statement must be true?', 'mcq', 'Use the directional constraint first, then test the end placements.', ''),
    (5, 3, 'If all roses are flowers and some flowers fade quickly, then:', 'mcq', 'Only conclusions guaranteed by the statements can be chosen.', ''),
    (5, 4, 'Mirror image of 2:35 is:', 'mcq', 'Subtract the given time from 11:60 for mirror clock questions.', ''),
    (5, 5, 'Find the odd one out: Square, Triangle, Circle, Rectangle, Pentagon.', 'mcq', 'All except one are polygons made of straight lines.', ''),
    (5, 6, 'If CAT is coded as DBU, then DOG is coded as:', 'mcq', 'Each letter is shifted forward by one place in the alphabet.', ''),
    (5, 7, 'Ravi walks 5 km north, turns right and walks 3 km, then turns right and walks 5 km. He is now:', 'mcq', 'The north and south movement cancel out, leaving him 3 km east of the start.', ''),
    (5, 8, 'Pointing to a girl, Rahul says, ''She is the daughter of my mother''s only son.'' The girl is Rahul''s:', 'mcq', 'Rahul''s mother''s only son is Rahul himself, so the girl is his daughter.', ''),
    (5, 9, 'If SOUTH is written as HTUOS, then NORTH will be written as:', 'mcq', 'The word is written in reverse order.', ''),
    (5, 10, 'If today is Wednesday, what day will it be after 45 days?', 'mcq', '45 leaves a remainder of 3 when divided by 7, so move 3 days ahead.', ''),
    (6, 1, 'Tell me about yourself in under 90 seconds.', 'long_text', '', 'Start with present role or education, mention 1 to 2 strong skills, add one project or internship example, and end with what role you are seeking.'),
    (6, 2, 'Describe a time you handled pressure or a tight deadline.', 'long_text', '', 'Choose a real situation, explain the deadline, describe your prioritization and communication, and end with the final result.'),
    (6, 3, 'Why should we hire you for an entry-level role?', 'long_text', '', 'Connect your learning speed, discipline, technical base, and attitude to the team''s needs.'),
    (7, 1, 'Which mission felt strongest this week, and why?', 'long_text', '', 'Reflect on the task that felt most natural and why.'),
    (7, 2, 'Which topic needs another round next week?', 'long_text', '', 'Name the weak spot and why it felt difficult.'),
    (7, 3, 'What is one change you will make to keep the 1-hour habit alive?', 'long_text', '', 'Choose one concrete action that removes friction.')
) as seed(day_number, position, prompt_md, question_type, explanation_md, sample_answer_md)
  on seed.day_number = pd.day_number
where pt.slug = 'placement-sprint-v1'
on conflict (task_id, position) do update
set
  prompt_md = excluded.prompt_md,
  question_type = excluded.question_type,
  explanation_md = excluded.explanation_md,
  sample_answer_md = excluded.sample_answer_md;

insert into public.question_options (
  task_question_id,
  position,
  option_text,
  is_correct
)
select
  tq.id,
  seed.position,
  seed.option_text,
  seed.is_correct
from public.task_questions tq
join public.tasks t on t.id = tq.task_id
join public.plan_days pd on pd.id = t.plan_day_id
join public.plan_templates pt on pt.id = pd.plan_template_id
join (
  values
    (1, 1, 1, '100', false),
    (1, 1, 2, '110', false),
    (1, 1, 3, '120', true),
    (1, 1, 4, '140', false),
    (1, 2, 1, '12%', false),
    (1, 2, 2, '15%', true),
    (1, 2, 3, '18%', false),
    (1, 2, 4, '20%', false),
    (1, 3, 1, '160', false),
    (1, 3, 2, '170', false),
    (1, 3, 3, '180', true),
    (1, 3, 4, '190', false),
    (1, 4, 1, '12%', false),
    (1, 4, 2, '15%', true),
    (1, 4, 3, '17%', false),
    (1, 4, 4, '20%', false),
    (1, 5, 1, 'No change', false),
    (1, 5, 2, '1% increase', false),
    (1, 5, 3, '1% decrease', true),
    (1, 5, 4, '2% decrease', false),
    (1, 6, 1, '196', false),
    (1, 6, 2, '208', false),
    (1, 6, 3, '224', true),
    (1, 6, 4, '240', false),
    (1, 7, 1, '18%', false),
    (1, 7, 2, '20%', true),
    (1, 7, 3, '22%', false),
    (1, 7, 4, '25%', false),
    (1, 8, 1, '110', false),
    (1, 8, 2, '120', true),
    (1, 8, 3, '135', false),
    (1, 8, 4, '150', false),
    (1, 9, 1, '72', false),
    (1, 9, 2, '76', false),
    (1, 9, 3, '80', true),
    (1, 9, 4, '84', false),
    (1, 10, 1, '1080', false),
    (1, 10, 2, '1150', false),
    (1, 10, 3, '1200', true),
    (1, 10, 4, '1250', false),
    (2, 1, 1, '50 km/h', false),
    (2, 1, 2, '60 km/h', true),
    (2, 1, 3, '70 km/h', false),
    (2, 1, 4, '80 km/h', false),
    (2, 2, 1, '10 s', false),
    (2, 2, 2, '12 s', true),
    (2, 2, 3, '15 s', false),
    (2, 2, 4, '18 s', false),
    (2, 3, 1, 'double', false),
    (2, 3, 2, 'half', true),
    (2, 3, 3, 'same', false),
    (2, 3, 4, 'four times', false),
    (2, 4, 1, '4 km', false),
    (2, 4, 2, '6 km', false),
    (2, 4, 3, '7 km', false),
    (2, 4, 4, '5 km', true),
    (2, 5, 1, '9 km/h', false),
    (2, 5, 2, '9.6 km/h', true),
    (2, 5, 3, '10 km/h', false),
    (2, 5, 4, '10.4 km/h', false),
    (2, 6, 1, '2.5 hours', false),
    (2, 6, 2, '3 hours', true),
    (2, 6, 3, '3.5 hours', false),
    (2, 6, 4, '4 hours', false),
    (2, 7, 1, '12 m/s', false),
    (2, 7, 2, '15 m/s', true),
    (2, 7, 3, '18 m/s', false),
    (2, 7, 4, '20 m/s', false),
    (2, 8, 1, '60 km/h', false),
    (2, 8, 2, '72 km/h', true),
    (2, 8, 3, '78 km/h', false),
    (2, 8, 4, '90 km/h', false),
    (2, 9, 1, '40 km', false),
    (2, 9, 2, '45 km', false),
    (2, 9, 3, '50 km', true),
    (2, 9, 4, '60 km', false),
    (2, 10, 1, '45 km/h', false),
    (2, 10, 2, '48 km/h', true),
    (2, 10, 3, '50 km/h', false),
    (2, 10, 4, '52 km/h', false),
    (5, 1, 1, '36', false),
    (5, 1, 2, '38', true),
    (5, 1, 3, '40', false),
    (5, 1, 4, '42', false),
    (5, 2, 1, 'A cannot be at the right end', true),
    (5, 2, 2, 'B must be at the center', false),
    (5, 2, 3, 'C must sit next to A', false),
    (5, 2, 4, 'A must be at the left end', false),
    (5, 3, 1, 'Some roses fade quickly', false),
    (5, 3, 2, 'All flowers are roses', false),
    (5, 3, 3, 'All roses are flowers', true),
    (5, 3, 4, 'No rose fades quickly', false),
    (5, 4, 1, '9:25', true),
    (5, 4, 2, '8:25', false),
    (5, 4, 3, '9:15', false),
    (5, 4, 4, '8:15', false),
    (5, 5, 1, 'Square', false),
    (5, 5, 2, 'Circle', true),
    (5, 5, 3, 'Rectangle', false),
    (5, 5, 4, 'Pentagon', false),
    (5, 6, 1, 'CPH', false),
    (5, 6, 2, 'EPH', true),
    (5, 6, 3, 'EOG', false),
    (5, 6, 4, 'FPH', false),
    (5, 7, 1, '3 km east of the starting point', true),
    (5, 7, 2, '3 km west of the starting point', false),
    (5, 7, 3, '5 km east of the starting point', false),
    (5, 7, 4, '5 km south of the starting point', false),
    (5, 8, 1, 'Sister', false),
    (5, 8, 2, 'Niece', false),
    (5, 8, 3, 'Daughter', true),
    (5, 8, 4, 'Cousin', false),
    (5, 9, 1, 'HTRON', true),
    (5, 9, 2, 'TROHN', false),
    (5, 9, 3, 'HORTN', false),
    (5, 9, 4, 'RHTON', false),
    (5, 10, 1, 'Friday', false),
    (5, 10, 2, 'Saturday', true),
    (5, 10, 3, 'Sunday', false),
    (5, 10, 4, 'Monday', false)
) as seed(day_number, question_position, position, option_text, is_correct)
  on seed.day_number = pd.day_number
 and seed.question_position = tq.position
where pt.slug = 'placement-sprint-v1'
on conflict (task_question_id, position) do update
set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct;
