export type UserMode = "demo" | "supabase";

export type TaskType = "aptitude" | "dsa" | "sql" | "hr" | "revision";

export type QuestionType = "mcq" | "short_text" | "long_text";

export type MissionStatus =
  | "locked"
  | "available"
  | "attempted"
  | "solution_unlocked"
  | "completed"
  | "missed";

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  isCorrect?: boolean;
}

export interface MissionQuestion {
  id: string;
  prompt: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  explanation?: string;
  sampleAnswer?: string;
  placeholder?: string;
  sourcePlatform?: string;
  sourceUrl?: string;
}

export interface Mission {
  id: string;
  planDayId?: string;
  dayNumber: number;
  weekNumber: number;
  taskType: TaskType;
  title: string;
  topic: string;
  estimatedMinutes: number;
  motivationCopy: string;
  instructions: string[];
  solution: string[];
  questions: MissionQuestion[];
  difficulty: "easy" | "medium" | "hard";
}

export interface StudentProfile {
  userId: string;
  fullName: string;
  collegeName: string;
  targetRole: string;
  timezone: string;
  role: "student" | "admin";
  fullAccess: boolean;
}

export interface ReminderSettings {
  emailEnabled: boolean;
  weeklyReminderEnabled: boolean;
  weeklyReminderDay: number;
  weeklyReminderHour: number;
  timezone: string;
}

export interface MissionProgress {
  progressId?: string | null;
  taskId: string;
  status: Exclude<MissionStatus, "locked" | "missed">;
  attemptCount: number;
  score: number | null;
  completedAt: string | null;
  solutionUnlockedAt: string | null;
}

export interface MissionQuestionResponse {
  answerText: string | null;
  selectedOptionId: string | null;
}

export interface ViewerContext {
  mode: UserMode;
  userId: string | null;
  displayName: string;
  profile: StudentProfile | null;
  isAdmin: boolean;
  hasFullAccess: boolean;
}

export interface DashboardSnapshot {
  mode: UserMode;
  profile: StudentProfile;
  hasFullAccess: boolean;
  reminderSettings: ReminderSettings;
  planName: string;
  totalDays: number;
  startDate: string;
  currentDay: number;
  currentWeek: number;
  currentStreak: number;
  completedCount: number;
  inProgressCount: number;
  weeklyCompletedCount: number;
  pendingCount: number;
  todayMission: Mission;
  missions: Mission[];
  progressByTaskId: Record<string, MissionProgress>;
  categoryBreakdown: Array<{
    taskType: TaskType;
    completed: number;
    planned: number;
  }>;
  visibleMissionStates: Array<{
    mission: Mission;
    status: MissionStatus;
    score: number | null;
  }>;
}

export interface MissionDetail {
  snapshot: DashboardSnapshot;
  mission: Mission;
  status: MissionStatus;
  progress: MissionProgress | null;
  responsesByQuestionId: Record<string, MissionQuestionResponse>;
  canRevealSolution: boolean;
  canMarkComplete: boolean;
}

export interface ProgressSnapshot {
  snapshot: DashboardSnapshot;
  weeklySummary: Array<{
    weekNumber: number;
    completed: number;
    planned: number;
    focus: string;
  }>;
}

export interface SettingsSnapshot {
  mode: UserMode;
  profile: StudentProfile;
  reminderSettings: ReminderSettings;
}

export interface AdminContentSnapshot {
  mode: UserMode;
  isAdmin: boolean;
  activePlanName: string;
  durationDays: number;
  publishedDays: number;
  sampleCsv: string;
}

export interface AdminUserOverview {
  userId: string;
  fullName: string;
  email: string;
  collegeName: string;
  targetRole: string;
  timezone: string;
  hasActivePlan: boolean;
  startDate: string | null;
  currentDay: number | null;
  totalDays: number | null;
  completedCount: number;
  inProgressCount: number;
  completionPercent: number;
  lastActivityAt: string | null;
  lastSignInAt: string | null;
  needsAttention: boolean;
}

export interface AdminRecentActivity {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  status: "completed" | "started";
  taskTitle: string;
  taskType: TaskType | null;
  dayNumber: number | null;
  occurredAt: string;
}

export interface AdminDashboardSnapshot {
  mode: UserMode;
  isAdmin: boolean;
  activePlanName: string;
  activePlanDurationDays: number;
  totalStudents: number;
  onboardedStudents: number;
  notStartedStudents: number;
  activeTodayCount: number;
  completedTodayCount: number;
  averageCompletionPercent: number;
  needsAttentionCount: number;
  recentActivity: AdminRecentActivity[];
  taskCompletionMix: Array<{
    taskType: TaskType;
    completed: number;
  }>;
  userOverview: AdminUserOverview[];
}

export interface DemoState {
  startDate: string;
  profile: Partial<StudentProfile>;
  reminderSettings: Partial<ReminderSettings>;
  attemptedTaskIds: string[];
  unlockedTaskIds: string[];
  completedTaskIds: string[];
  scores: Record<string, number>;
  responsesByTaskId: Record<string, Record<string, string>>;
}
