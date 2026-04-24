# Placement Preparation Tracker MVP Feature Spec

## 1. Product Summary

Working title: `Daily Placement Prep`

This product is a web-based preparation tracker for students who want a structured, motivating 90-day placement journey. The app gives each student one focused daily mission designed for about 60 minutes of work. The mission may contain aptitude questions, a DSA problem, an SQL task, HR interview prompts, or a weekly revision/reflection task.

The key behavior is:

1. Student logs in.
2. Student sees the task for the day.
3. Student attempts the task before seeing the answer.
4. Student unlocks the solution or sample answer.
5. Student marks the task as completed.
6. The app tracks streaks, progress, and weekly consistency.

The MVP goal is not to build a full coding platform. The MVP goal is to help students stay consistent and complete a guided 3-month preparation plan.

## 2. Problem Statement

Students preparing for placement often fail because:

- they do not know what to study each day
- they try to study too many topics at once
- they lose momentum after a few days
- they lack visible progress and reminders
- they postpone DSA, SQL, and HR prep until it is too late

The app solves this by giving students one clear daily commitment with a simple loop:

- attempt
- review solution
- mark complete
- continue tomorrow

## 3. Product Goals

### Primary Goals

- Help students commit at least 1 hour per day for 90 days.
- Make the prep journey simple enough that students can start every day without planning overhead.
- Cover the main placement topics in a balanced way: aptitude, DSA, SQL, HR, revision.
- Build motivation using streaks, milestone messaging, and visible progress.
- Launch quickly using mostly free tools and low-maintenance operations.

### Secondary Goals

- Let an admin manage the 90-day content without editing code for every question.
- Support a first pilot with a small to medium batch of students.
- Collect enough usage signals to decide whether to build a richer platform later.

## 4. Non-Goals for MVP

- No real-time coding judge for DSA submissions.
- No SQL execution sandbox.
- No AI grading.
- No campus-specific placement drives or company workflows.
- No complex leaderboard or social feed.
- No native mobile app.
- No multilingual content in version 1.

## 5. Target Users

### Student

A college student or recent graduate preparing for placement interviews and aptitude rounds who wants daily structure and motivation.

### Admin

A content manager, instructor, or founder who uploads and maintains the daily plan, questions, solutions, and weekly reminders.

## 6. Core User Promise

"Show up for one hour a day, follow the mission, and complete a structured 90-day placement prep journey."

## 7. MVP Scope

### Included in MVP

- Email/password login
- Student onboarding
- 90-day plan assignment starting from the signup date
- One daily mission per day
- Mixed mission types:
  - 10 aptitude questions
  - 1 DSA problem
  - 1 SQL task
  - 3 HR prompts or a reflection task
- Attempt-first flow before solution unlock
- Auto-evaluation for MCQ aptitude questions
- Self-evaluation for DSA, SQL, and HR in v1
- Mark task as completed
- Dashboard with current day, progress, streak, and pending work
- Weekly reminder email
- Admin content upload through CSV or a simple content form

### Deferred to Later Versions

- Timed quizzes
- Coding execution environment
- SQL query runner
- AI feedback on answers
- Community discussions
- Leaderboards
- Referral programs
- Premium plans

## 8. Suggested 90-Day Content Pattern

The exact plan can change, but the weekly rhythm below is realistic for the MVP:

- Monday: Aptitude set of 10 questions
- Tuesday: Aptitude set of 10 questions
- Wednesday: 1 DSA problem
- Thursday: 1 SQL task
- Friday: Aptitude set of 10 questions
- Saturday: 3 HR or behavioral questions
- Sunday: revision, backlog catch-up, or weekly reflection

This creates balanced repetition without making the app too heavy.

## 9. Daily User Experience

### Student Journey

1. Student logs in and lands on the dashboard.
2. Dashboard shows:
   - current day number
   - today's mission
   - estimated time
   - streak
   - tasks completed so far
   - pending backlog if any
3. Student opens the daily mission.
4. Student answers the questions or writes an attempt.
5. Student submits.
6. App reveals the solution, explanation, or sample answer.
7. Student clicks `Mark as Complete`.
8. App updates progress and shows the next milestone.

### Motivation Layer

The product should feel supportive, not punishing.

Examples:

- "Day 14 of 90. One hour today keeps your momentum alive."
- "3-day streak. Keep going."
- "Week 2 complete. You are building consistency."
- "You have completed 20 of 90 missions."

## 10. Functional Requirements

### FR-1 Authentication

- Students can sign up with email and password.
- Students can log in and log out securely.
- Forgotten password flow should be supported by the auth provider.

### FR-2 Student Profile

- Student profile stores:
  - full name
  - college name
  - target role
  - timezone
  - reminder preference
- Profile should be editable from settings.

### FR-3 Plan Enrollment

- Each student gets enrolled into one active 90-day plan.
- Day 1 starts on the student's chosen start date.
- Future days stay locked.
- Past days remain visible.

### FR-4 Daily Mission Engine

- The app determines the student's active day based on the plan start date.
- Each day has one mission with one primary task type.
- Mission contains:
  - title
  - topic
  - estimated duration
  - instructions
  - questions or prompts
  - solution content
  - motivation message

### FR-5 Attempt Capture

- Students can submit answers for the current mission.
- Aptitude MCQ answers are stored per question.
- DSA, SQL, and HR answers are stored as text responses in v1.
- The system stores attempt timestamp and attempt count.

### FR-6 Solution Unlock

- Solution is hidden until the student makes at least one attempt.
- For subjective tasks, a simple `I have tried this` confirmation is acceptable.
- Once unlocked, the solution remains visible for that student.

### FR-7 Completion Marking

- The mission is marked complete only after solution unlock and explicit confirmation by the student.
- Completion updates:
  - completed count
  - streak
  - weekly progress

### FR-8 Progress Dashboard

- Dashboard shows:
  - current day
  - current streak
  - total completed missions
  - week-wise progress
  - pending incomplete missions
- Dashboard should be mobile-friendly.

### FR-9 Reminder System

- Students can opt into reminder emails.
- MVP reminder behavior:
  - one weekly reminder email
  - one weekly summary email for active users is optional
- Reminder content should reinforce the 1-hour daily commitment.

### FR-10 Admin Content Management

- Admin can upload or edit the 90-day plan.
- Admin can define:
  - day number
  - category
  - title
  - instructions
  - questions
  - correct options for aptitude
  - solution content
  - estimated minutes
  - motivation copy
- CSV import is enough for MVP.

### FR-11 Basic Analytics

- Track:
  - signups
  - active users
  - mission completion rate
  - average missions completed per student
  - weekly retention

## 11. Task Types for MVP

### Aptitude

- Format: 5 MCQs
- Stored with options and correct answers
- System can show score after submission
- Explanation shown per question

### DSA

- Format: 1 coding or algorithm question
- Student writes approach or pseudocode in a text box
- Solution page shows:
  - expected approach
  - optimized logic
  - sample code
- Student self-marks completion

### SQL

- Format: 1 SQL problem
- Student writes a query in a text box
- Solution page shows:
  - correct query
  - explanation
  - alternate approach if needed
- Student self-marks completion

### HR

- Format: 3 reflective interview questions or one mock interview task
- Student writes bullet answers
- Solution page shows:
  - sample talking points
  - answer structure
  - do and do not tips

### Revision / Weekly Reflection

- Catch-up task or short review set
- Weekly reflection prompts:
  - what was completed
  - what was missed
  - what to improve next week

## 12. Status Rules

Each mission has one lifecycle for each student:

- `locked`
- `available`
- `attempted`
- `solution_unlocked`
- `completed`

Optional derived label for UI only:

- `missed` if the mission date is in the past and status is not `completed`

Rules:

- Future missions are always `locked`.
- A mission becomes `available` on its scheduled day for that student.
- At least one attempt is required before `solution_unlocked`.
- Only `solution_unlocked` missions can be marked `completed`.

## 13. Admin Content Workflow

### Simple MVP Workflow

1. Admin prepares a CSV file.
2. Admin uploads it through the admin panel.
3. System validates required fields.
4. Admin previews imported rows.
5. Admin publishes the plan.

### Suggested CSV Columns

- `plan_version`
- `day_number`
- `task_type`
- `title`
- `topic`
- `instructions`
- `estimated_minutes`
- `motivation_copy`
- `question_payload_json`
- `solution_payload_json`
- `is_published`

## 14. MVP Screens

- Landing page
- Login page
- Signup page
- Onboarding page
- Student dashboard
- Daily mission page
- Solution and completion state on the mission page
- Progress page
- Settings page
- Admin content upload page

## 15. Non-Functional Requirements

- Responsive layout for desktop and mobile browser
- Clean load time on low-end devices
- Secure auth and row-level access control
- Low recurring cost
- Basic observability through logs and error reporting
- Content changes should not require a full code redeploy

## 16. Success Metrics for MVP Pilot

- Signup to Day 1 completion rate
- Day 7 retention
- Week 4 retention
- Average missions completed per active user
- Number of users maintaining at least a 5-day streak
- Number of users reaching Day 30 and Day 60

## 17. Launch Constraints and Simplifications

To launch quickly, the product should intentionally simplify:

- DSA is answer-and-review, not code execution.
- SQL is answer-and-review, not database execution.
- HR uses guided sample answers, not scoring.
- Reminder logic is weekly, not highly personalized.
- Admin tools are simple upload and edit screens, not a complex CMS.

## 18. Recommended Free or Low-Cost MVP Stack

- Frontend and deployment: `Next.js` on `Vercel`
- Auth and database: `Supabase`
- Email reminders: `Resend`
- Content preparation: `Google Sheets` exported to CSV
- Design and wireframes: `Figma`

This stack keeps the MVP launchable by one small team with minimal cost.

## 19. MVP Build Order

### Phase 1

- Auth
- Profile
- Plan data model
- Dashboard shell

### Phase 2

- Daily mission page
- Attempt capture
- Solution unlock
- Mark complete

### Phase 3

- Progress and streaks
- Admin content upload
- Reminder emails

### Phase 4

- QA
- seed content
- pilot launch

## 20. Launch Checklist

- 90 days of content uploaded
- Student auth tested
- Progress and completion tested
- Reminder email tested
- Admin import tested with sample and real CSV
- Mobile dashboard tested
- Privacy policy and terms page added
- Pilot batch invited

## 21. Recommendation

Yes, this should be built and launched as an MVP first.

The right version 1 is:

- one focused daily mission
- a supportive motivation layer
- visible progress
- simple reminders
- low-cost operations

If students use it consistently for even 2 to 4 weeks, you will learn enough to decide whether to invest in richer features like coding judges, AI coaching, and mock interview feedback.
