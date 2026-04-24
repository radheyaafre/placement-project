import type { DemoState, Mission, MissionProgress, MissionStatus } from "@/types/domain";
import { parseLocalDate, percent, toDateOnly } from "@/lib/utils";

export function calculateCurrentDay(
  startDate: string,
  totalDays: number,
  timeZone?: string,
  now = new Date()
) {
  const start = parseLocalDate(startDate);
  const today = parseLocalDate(toDateOnly(now, timeZone));
  const startUtc = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const nowUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const rawDay = Math.floor((nowUtc - startUtc) / 86_400_000) + 1;

  if (rawDay < 1) {
    return 1;
  }

  return Math.min(rawDay, totalDays);
}

export function calculateWeekNumber(dayNumber: number) {
  return Math.max(1, Math.ceil(dayNumber / 7));
}

export function buildDemoProgressMap(
  missions: Mission[],
  demoState: DemoState
): Record<string, MissionProgress> {
  return missions.reduce<Record<string, MissionProgress>>((acc, mission) => {
    let status: MissionProgress["status"] | null = null;

    if (demoState.completedTaskIds.includes(mission.id)) {
      status = "completed";
    } else if (demoState.unlockedTaskIds.includes(mission.id)) {
      status = "solution_unlocked";
    } else if (demoState.attemptedTaskIds.includes(mission.id)) {
      status = "attempted";
    }

    if (!status) {
      return acc;
    }

    acc[mission.id] = {
      taskId: mission.id,
      status,
      attemptCount: 1,
      score: demoState.scores[mission.id] ?? null,
      completedAt:
        status === "completed" ? new Date().toISOString() : null,
      solutionUnlockedAt:
        status === "solution_unlocked" || status === "completed"
          ? new Date().toISOString()
          : null
    };

    return acc;
  }, {});
}

export function deriveMissionStatus(
  mission: Mission,
  currentDay: number,
  progress: MissionProgress | null,
  unlockAll = false
): MissionStatus {
  if (progress?.status === "completed") {
    return "completed";
  }

  if (progress?.status === "solution_unlocked") {
    return "solution_unlocked";
  }

  if (progress?.status === "attempted") {
    return "attempted";
  }

  if (unlockAll) {
    return "available";
  }

  if (mission.dayNumber > currentDay) {
    return "locked";
  }

  if (mission.dayNumber < currentDay) {
    return "missed";
  }

  return "available";
}

export function calculateCurrentStreak(
  missions: Mission[],
  progressByTaskId: Record<string, MissionProgress>,
  currentDay: number
) {
  const completedDays = new Set(
    missions
      .filter((mission) => progressByTaskId[mission.id]?.status === "completed")
      .map((mission) => mission.dayNumber)
  );

  let streak = 0;
  let cursor = completedDays.has(currentDay) ? currentDay : currentDay - 1;

  while (cursor >= 1 && completedDays.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}

export function scoreAptitudeMission(
  mission: Mission,
  answers: Record<string, string>
) {
  let correct = 0;

  const byQuestion = mission.questions.map((question) => {
    const correctOption = question.options?.find((option) => option.isCorrect);
    const selectedOptionId = answers[question.id];
    const isCorrect = Boolean(
      correctOption && selectedOptionId === correctOption.id
    );

    if (isCorrect) {
      correct += 1;
    }

    return {
      questionId: question.id,
      selectedOptionId: selectedOptionId || null,
      correctOptionId: correctOption?.id || null,
      isCorrect
    };
  });

  return {
    total: mission.questions.length,
    correct,
    score: percent(correct, mission.questions.length),
    byQuestion
  };
}
