import type {
  Mission,
  ReminderSettings,
  StudentProfile,
  TaskType
} from "@/types/domain";

export const demoPlan = {
  id: "placement-sprint-v1",
  name: "Placement Sprint v1",
  totalDays: 90
};

export const demoProfile: StudentProfile = {
  userId: "demo-student",
  fullName: "Demo Student",
  collegeName: "Placement Launchpad Academy",
  targetRole: "Software Engineer",
  timezone: "Asia/Kolkata",
  role: "admin",
  fullAccess: true
};

export const demoReminderSettings: ReminderSettings = {
  emailEnabled: true,
  weeklyReminderEnabled: true,
  weeklyReminderDay: 0,
  weeklyReminderHour: 19,
  timezone: "Asia/Kolkata"
};

export const taskTypeOrder: TaskType[] = [
  "aptitude",
  "dsa",
  "sql",
  "hr",
  "revision"
];

export const demoMissions: Mission[] = [
  {
    id: "mission-day-1",
    dayNumber: 1,
    weekNumber: 1,
    taskType: "aptitude",
    title: "Percentages Warm-Up",
    topic: "Percentages and ratio",
    estimatedMinutes: 60,
    motivationCopy: "Strong placement prep starts with one disciplined hour.",
    instructions: [
      "Answer all ten questions before looking at the explanations.",
      "Use rough paper for calculations and note where you lost time."
    ],
    solution: [
      "Review both the arithmetic and the shortcut pattern after attempting the set.",
      "Track whether your mistakes came from concept confusion or calculation speed."
    ],
    difficulty: "easy",
    questions: [
      {
        id: "m1-q1",
        prompt: "What is 25% of 480?",
        questionType: "mcq",
        explanation: "25% is one-fourth, so divide 480 by 4.",
        options: [
          { id: "m1-q1-a", label: "A", text: "100" },
          { id: "m1-q1-b", label: "B", text: "110" },
          { id: "m1-q1-c", label: "C", text: "120", isCorrect: true },
          { id: "m1-q1-d", label: "D", text: "140" }
        ]
      },
      {
        id: "m1-q2",
        prompt: "A number increases from 80 to 92. What is the percentage increase?",
        questionType: "mcq",
        explanation: "Increase is 12 on a base of 80, so 12/80 x 100.",
        options: [
          { id: "m1-q2-a", label: "A", text: "12%" },
          { id: "m1-q2-b", label: "B", text: "15%", isCorrect: true },
          { id: "m1-q2-c", label: "C", text: "18%" },
          { id: "m1-q2-d", label: "D", text: "20%" }
        ]
      },
      {
        id: "m1-q3",
        prompt: "If 40% of a number is 72, what is the number?",
        questionType: "mcq",
        explanation: "Number = 72 / 0.4.",
        options: [
          { id: "m1-q3-a", label: "A", text: "160" },
          { id: "m1-q3-b", label: "B", text: "170" },
          { id: "m1-q3-c", label: "C", text: "180", isCorrect: true },
          { id: "m1-q3-d", label: "D", text: "190" }
        ]
      },
      {
        id: "m1-q4",
        prompt: "Price of a book falls from 500 to 425. What is the percentage decrease?",
        questionType: "mcq",
        explanation: "Decrease is 75 on a base of 500.",
        options: [
          { id: "m1-q4-a", label: "A", text: "12%" },
          { id: "m1-q4-b", label: "B", text: "15%", isCorrect: true },
          { id: "m1-q4-c", label: "C", text: "17%" },
          { id: "m1-q4-d", label: "D", text: "20%" }
        ]
      },
      {
        id: "m1-q5",
        prompt: "A salary is raised by 10% and then reduced by 10%. Net change is:",
        questionType: "mcq",
        explanation:
          "Successive +10% and -10% lead to a 1% net decrease, not zero.",
        options: [
          { id: "m1-q5-a", label: "A", text: "No change" },
          { id: "m1-q5-b", label: "B", text: "1% increase" },
          { id: "m1-q5-c", label: "C", text: "1% decrease", isCorrect: true },
          { id: "m1-q5-d", label: "D", text: "2% decrease" }
        ]
      },
      {
        id: "m1-q6",
        prompt: "What is 35% of 640?",
        questionType: "mcq",
        explanation: "10% of 640 is 64, so 30% is 192 and 5% is 32.",
        options: [
          { id: "m1-q6-a", label: "A", text: "196" },
          { id: "m1-q6-b", label: "B", text: "208" },
          { id: "m1-q6-c", label: "C", text: "224", isCorrect: true },
          { id: "m1-q6-d", label: "D", text: "240" }
        ]
      },
      {
        id: "m1-q7",
        prompt: "A price rises from 250 to 300. What is the percentage increase?",
        questionType: "mcq",
        explanation: "Increase is 50 on the original base of 250, so 50/250 x 100.",
        options: [
          { id: "m1-q7-a", label: "A", text: "18%" },
          { id: "m1-q7-b", label: "B", text: "20%", isCorrect: true },
          { id: "m1-q7-c", label: "C", text: "22%" },
          { id: "m1-q7-d", label: "D", text: "25%" }
        ]
      },
      {
        id: "m1-q8",
        prompt: "If a number is decreased by 25% and becomes 90, the original number is:",
        questionType: "mcq",
        explanation: "After a 25% decrease, 75% of the number remains, so x = 90 / 0.75.",
        options: [
          { id: "m1-q8-a", label: "A", text: "110" },
          { id: "m1-q8-b", label: "B", text: "120", isCorrect: true },
          { id: "m1-q8-c", label: "C", text: "135" },
          { id: "m1-q8-d", label: "D", text: "150" }
        ]
      },
      {
        id: "m1-q9",
        prompt: "In a class, 60% of the students are boys and there are 48 boys. Total students are:",
        questionType: "mcq",
        explanation: "If 60% corresponds to 48, divide 48 by 0.6.",
        options: [
          { id: "m1-q9-a", label: "A", text: "72" },
          { id: "m1-q9-b", label: "B", text: "76" },
          { id: "m1-q9-c", label: "C", text: "80", isCorrect: true },
          { id: "m1-q9-d", label: "D", text: "84" }
        ]
      },
      {
        id: "m1-q10",
        prompt: "After a 20% discount, an item costs 960. The marked price was:",
        questionType: "mcq",
        explanation: "A 20% discount means the sale price is 80% of the marked price.",
        options: [
          { id: "m1-q10-a", label: "A", text: "1080" },
          { id: "m1-q10-b", label: "B", text: "1150" },
          { id: "m1-q10-c", label: "C", text: "1200", isCorrect: true },
          { id: "m1-q10-d", label: "D", text: "1250" }
        ]
      }
    ]
  },
  {
    id: "mission-day-2",
    dayNumber: 2,
    weekNumber: 1,
    taskType: "aptitude",
    title: "Speed and Time Sprint",
    topic: "Time, speed, distance",
    estimatedMinutes: 60,
    motivationCopy: "Consistency beats intensity when the plan is clear.",
    instructions: [
      "Solve all ten questions without a calculator.",
      "Try to write the governing formula before each answer."
    ],
    solution: [
      "This set is about choosing the correct formula before substituting numbers.",
      "When average speed is involved, use total distance divided by total time."
    ],
    difficulty: "medium",
    questions: [
      {
        id: "m2-q1",
        prompt: "A car covers 180 km in 3 hours. Its speed is:",
        questionType: "mcq",
        explanation: "Speed = distance / time.",
        options: [
          { id: "m2-q1-a", label: "A", text: "50 km/h" },
          { id: "m2-q1-b", label: "B", text: "60 km/h", isCorrect: true },
          { id: "m2-q1-c", label: "C", text: "70 km/h" },
          { id: "m2-q1-d", label: "D", text: "80 km/h" }
        ]
      },
      {
        id: "m2-q2",
        prompt: "A train running at 72 km/h covers 240 m in how many seconds?",
        questionType: "mcq",
        explanation: "72 km/h = 20 m/s. Time = 240 / 20.",
        options: [
          { id: "m2-q2-a", label: "A", text: "10 s" },
          { id: "m2-q2-b", label: "B", text: "12 s", isCorrect: true },
          { id: "m2-q2-c", label: "C", text: "15 s" },
          { id: "m2-q2-d", label: "D", text: "18 s" }
        ]
      },
      {
        id: "m2-q3",
        prompt: "If speed doubles, time to travel the same distance becomes:",
        questionType: "mcq",
        explanation: "Time is inversely proportional to speed.",
        options: [
          { id: "m2-q3-a", label: "A", text: "double" },
          { id: "m2-q3-b", label: "B", text: "half", isCorrect: true },
          { id: "m2-q3-c", label: "C", text: "same" },
          { id: "m2-q3-d", label: "D", text: "four times" }
        ]
      },
      {
        id: "m2-q4",
        prompt:
          "A person walks at 6 km/h instead of 5 km/h and reaches 10 minutes early. Distance is:",
        questionType: "mcq",
        explanation:
          "Use difference in time for the same distance: D/5 - D/6 = 10/60.",
        options: [
          { id: "m2-q4-a", label: "A", text: "4 km" },
          { id: "m2-q4-b", label: "B", text: "6 km" },
          { id: "m2-q4-c", label: "C", text: "7 km" },
          { id: "m2-q4-d", label: "D", text: "5 km", isCorrect: true }
        ]
      },
      {
        id: "m2-q5",
        prompt:
          "An athlete runs the first half of a race at 8 km/h and the second half at 12 km/h. Average speed is:",
        questionType: "mcq",
        explanation:
          "For equal distances, average speed is 2ab / (a + b).",
        options: [
          { id: "m2-q5-a", label: "A", text: "9 km/h" },
          { id: "m2-q5-b", label: "B", text: "9.6 km/h", isCorrect: true },
          { id: "m2-q5-c", label: "C", text: "10 km/h" },
          { id: "m2-q5-d", label: "D", text: "10.4 km/h" }
        ]
      },
      {
        id: "m2-q6",
        prompt: "A biker covers 150 km at 50 km/h. Time taken is:",
        questionType: "mcq",
        explanation: "Time = distance / speed = 150 / 50.",
        options: [
          { id: "m2-q6-a", label: "A", text: "2.5 hours" },
          { id: "m2-q6-b", label: "B", text: "3 hours", isCorrect: true },
          { id: "m2-q6-c", label: "C", text: "3.5 hours" },
          { id: "m2-q6-d", label: "D", text: "4 hours" }
        ]
      },
      {
        id: "m2-q7",
        prompt: "54 km/h is equal to:",
        questionType: "mcq",
        explanation: "To convert km/h to m/s, multiply by 5/18.",
        options: [
          { id: "m2-q7-a", label: "A", text: "12 m/s" },
          { id: "m2-q7-b", label: "B", text: "15 m/s", isCorrect: true },
          { id: "m2-q7-c", label: "C", text: "18 m/s" },
          { id: "m2-q7-d", label: "D", text: "20 m/s" }
        ]
      },
      {
        id: "m2-q8",
        prompt: "A 120 m train crosses a pole in 6 seconds. Its speed is:",
        questionType: "mcq",
        explanation: "Speed = 120/6 = 20 m/s, which is 72 km/h.",
        options: [
          { id: "m2-q8-a", label: "A", text: "60 km/h" },
          { id: "m2-q8-b", label: "B", text: "72 km/h", isCorrect: true },
          { id: "m2-q8-c", label: "C", text: "78 km/h" },
          { id: "m2-q8-d", label: "D", text: "90 km/h" }
        ]
      },
      {
        id: "m2-q9",
        prompt: "A car moving at 40 km/h reaches 15 minutes late, but at 50 km/h it arrives on time. Distance is:",
        questionType: "mcq",
        explanation: "Use D/40 - D/50 = 15/60 to solve for distance.",
        options: [
          { id: "m2-q9-a", label: "A", text: "40 km" },
          { id: "m2-q9-b", label: "B", text: "45 km" },
          { id: "m2-q9-c", label: "C", text: "50 km", isCorrect: true },
          { id: "m2-q9-d", label: "D", text: "60 km" }
        ]
      },
      {
        id: "m2-q10",
        prompt:
          "A bus travels 120 km at 40 km/h and the next 120 km at 60 km/h. Average speed for the whole trip is:",
        questionType: "mcq",
        explanation:
          "Total distance is 240 km and total time is 3 + 2 = 5 hours.",
        options: [
          { id: "m2-q10-a", label: "A", text: "45 km/h" },
          { id: "m2-q10-b", label: "B", text: "48 km/h", isCorrect: true },
          { id: "m2-q10-c", label: "C", text: "50 km/h" },
          { id: "m2-q10-d", label: "D", text: "52 km/h" }
        ]
      }
    ]
  },
  {
    id: "mission-day-3",
    dayNumber: 3,
    weekNumber: 1,
    taskType: "dsa",
    title: "Array Patterns: Two Sum",
    topic: "Hashing and arrays",
    estimatedMinutes: 60,
    motivationCopy: "One well-understood pattern today saves panic later.",
    instructions: [
      "Write the brute-force idea first, then the optimized idea.",
      "Mention time and space complexity in your own words."
    ],
    solution: [
      "Use a hash map to store numbers seen so far and the index where each appeared.",
      "For each number, compute target - current. If the complement already exists in the map, return the stored index and current index.",
      "This solves the problem in O(n) time with O(n) extra space."
    ],
    difficulty: "easy",
    questions: [
      {
        id: "m3-q1",
        prompt:
          "Given an array of integers and a target, return the indices of the two numbers whose sum equals the target. Write your approach and sample code or pseudocode.",
        questionType: "long_text",
        placeholder: "Write the brute-force idea, optimized approach, and complexity..."
      }
    ]
  },
  {
    id: "mission-day-4",
    dayNumber: 4,
    weekNumber: 1,
    taskType: "sql",
    title: "Second Highest Salary",
    topic: "SQL ranking and aggregation",
    estimatedMinutes: 50,
    motivationCopy: "Small daily reps make technical interviews feel familiar.",
    instructions: [
      "Attempt the query first from memory.",
      "If you know two approaches, write both."
    ],
    solution: [
      "A simple approach is to use a subquery with MAX on salaries lower than the overall maximum.",
      "A ranking approach uses DENSE_RANK over salary descending and selects rank 2.",
      "Mention null handling if there is no second highest value."
    ],
    difficulty: "medium",
    questions: [
      {
        id: "m4-q1",
        prompt:
          "Write an SQL query to find the second highest salary from an Employee table with columns employee_id, name, and salary.",
        questionType: "long_text",
        placeholder: "SELECT ... FROM ... WHERE ..."
      }
    ]
  },
  {
    id: "mission-day-5",
    dayNumber: 5,
    weekNumber: 1,
    taskType: "aptitude",
    title: "Logical Reasoning: Seating and Patterns",
    topic: "Reasoning",
    estimatedMinutes: 60,
    motivationCopy: "Momentum is built in ordinary days like this one.",
    instructions: [
      "Read all ten questions carefully before choosing an answer.",
      "Draw the arrangement rather than solving in your head."
    ],
    solution: [
      "Reasoning improves fastest when you convert words into structure.",
      "Use tables, circles, and elimination patterns instead of mental juggling."
    ],
    difficulty: "medium",
    questions: [
      {
        id: "m5-q1",
        prompt: "Which number comes next in the series: 3, 6, 11, 18, 27, ?",
        questionType: "mcq",
        explanation: "Differences are 3, 5, 7, 9, so next difference is 11.",
        options: [
          { id: "m5-q1-a", label: "A", text: "36" },
          { id: "m5-q1-b", label: "B", text: "38", isCorrect: true },
          { id: "m5-q1-c", label: "C", text: "40" },
          { id: "m5-q1-d", label: "D", text: "42" }
        ]
      },
      {
        id: "m5-q2",
        prompt:
          "Five students sit in a row. If A is to the immediate left of B, and C is at one end, which statement must be true?",
        questionType: "mcq",
        explanation:
          "Use the directional constraint first, then test the end placements.",
        options: [
          { id: "m5-q2-a", label: "A", text: "A cannot be at the right end", isCorrect: true },
          { id: "m5-q2-b", label: "B", text: "B must be at the center" },
          { id: "m5-q2-c", label: "C", text: "C must sit next to A" },
          { id: "m5-q2-d", label: "D", text: "A must be at the left end" }
        ]
      },
      {
        id: "m5-q3",
        prompt: "If all roses are flowers and some flowers fade quickly, then:",
        questionType: "mcq",
        explanation:
          "Only conclusions guaranteed by the statements can be chosen.",
        options: [
          { id: "m5-q3-a", label: "A", text: "Some roses fade quickly" },
          { id: "m5-q3-b", label: "B", text: "All flowers are roses" },
          { id: "m5-q3-c", label: "C", text: "All roses are flowers", isCorrect: true },
          { id: "m5-q3-d", label: "D", text: "No rose fades quickly" }
        ]
      },
      {
        id: "m5-q4",
        prompt: "Mirror image of 2:35 is:",
        questionType: "mcq",
        explanation:
          "Subtract the given time from 11:60 for mirror clock questions.",
        options: [
          { id: "m5-q4-a", label: "A", text: "9:25", isCorrect: true },
          { id: "m5-q4-b", label: "B", text: "8:25" },
          { id: "m5-q4-c", label: "C", text: "9:15" },
          { id: "m5-q4-d", label: "D", text: "8:15" }
        ]
      },
      {
        id: "m5-q5",
        prompt:
          "Find the odd one out: Square, Triangle, Circle, Rectangle, Pentagon.",
        questionType: "mcq",
        explanation:
          "All except one are polygons made of straight lines.",
        options: [
          { id: "m5-q5-a", label: "A", text: "Square" },
          { id: "m5-q5-b", label: "B", text: "Circle", isCorrect: true },
          { id: "m5-q5-c", label: "C", text: "Rectangle" },
          { id: "m5-q5-d", label: "D", text: "Pentagon" }
        ]
      },
      {
        id: "m5-q6",
        prompt: "If CAT is coded as DBU, then DOG is coded as:",
        questionType: "mcq",
        explanation: "Each letter is shifted forward by one place in the alphabet.",
        options: [
          { id: "m5-q6-a", label: "A", text: "CPH" },
          { id: "m5-q6-b", label: "B", text: "EPH", isCorrect: true },
          { id: "m5-q6-c", label: "C", text: "EOG" },
          { id: "m5-q6-d", label: "D", text: "FPH" }
        ]
      },
      {
        id: "m5-q7",
        prompt:
          "Ravi walks 5 km north, turns right and walks 3 km, then turns right and walks 5 km. He is now:",
        questionType: "mcq",
        explanation: "The north and south movement cancel out, leaving him 3 km east of the start.",
        options: [
          { id: "m5-q7-a", label: "A", text: "3 km east of the starting point", isCorrect: true },
          { id: "m5-q7-b", label: "B", text: "3 km west of the starting point" },
          { id: "m5-q7-c", label: "C", text: "5 km east of the starting point" },
          { id: "m5-q7-d", label: "D", text: "5 km south of the starting point" }
        ]
      },
      {
        id: "m5-q8",
        prompt:
          "Pointing to a girl, Rahul says, \"She is the daughter of my mother's only son.\" The girl is Rahul's:",
        questionType: "mcq",
        explanation: "Rahul's mother's only son is Rahul himself, so the girl is his daughter.",
        options: [
          { id: "m5-q8-a", label: "A", text: "Sister" },
          { id: "m5-q8-b", label: "B", text: "Niece" },
          { id: "m5-q8-c", label: "C", text: "Daughter", isCorrect: true },
          { id: "m5-q8-d", label: "D", text: "Cousin" }
        ]
      },
      {
        id: "m5-q9",
        prompt: "If SOUTH is written as HTUOS, then NORTH will be written as:",
        questionType: "mcq",
        explanation: "The word is written in reverse order.",
        options: [
          { id: "m5-q9-a", label: "A", text: "HTRON", isCorrect: true },
          { id: "m5-q9-b", label: "B", text: "TROHN" },
          { id: "m5-q9-c", label: "C", text: "HORTN" },
          { id: "m5-q9-d", label: "D", text: "RHTON" }
        ]
      },
      {
        id: "m5-q10",
        prompt: "If today is Wednesday, what day will it be after 45 days?",
        questionType: "mcq",
        explanation: "45 leaves a remainder of 3 when divided by 7, so move 3 days ahead.",
        options: [
          { id: "m5-q10-a", label: "A", text: "Friday" },
          { id: "m5-q10-b", label: "B", text: "Saturday", isCorrect: true },
          { id: "m5-q10-c", label: "C", text: "Sunday" },
          { id: "m5-q10-d", label: "D", text: "Monday" }
        ]
      }
    ]
  },
  {
    id: "mission-day-6",
    dayNumber: 6,
    weekNumber: 1,
    taskType: "hr",
    title: "HR Reflection Lab",
    topic: "Behavioral interview readiness",
    estimatedMinutes: 45,
    motivationCopy: "Placement success is also about clarity, not only coding.",
    instructions: [
      "Answer in bullet points first.",
      "Use a brief STAR structure where possible."
    ],
    solution: [
      "For HR answers, structure matters more than sounding perfect.",
      "Use context, your action, and the outcome instead of long stories.",
      "Keep answers specific and anchored in real examples."
    ],
    difficulty: "easy",
    questions: [
      {
        id: "m6-q1",
        prompt: "Tell me about yourself in under 90 seconds.",
        questionType: "long_text",
        sampleAnswer:
          "Start with present role or education, mention 1 to 2 strong skills, add one project or internship example, and end with what role you are seeking.",
        placeholder: "Write a concise self-introduction..."
      },
      {
        id: "m6-q2",
        prompt: "Describe a time you handled pressure or a tight deadline.",
        questionType: "long_text",
        sampleAnswer:
          "Choose a real situation, explain the deadline, describe your prioritization and communication, and end with the final result.",
        placeholder: "Write your STAR answer..."
      },
      {
        id: "m6-q3",
        prompt: "Why should we hire you for an entry-level role?",
        questionType: "long_text",
        sampleAnswer:
          "Connect your learning speed, discipline, technical base, and attitude to the team's needs.",
        placeholder: "Write 4 to 6 strong bullet points..."
      }
    ]
  },
  {
    id: "mission-day-7",
    dayNumber: 7,
    weekNumber: 1,
    taskType: "revision",
    title: "Weekly Review and Reset",
    topic: "Reflection and backlog control",
    estimatedMinutes: 40,
    motivationCopy: "Reflection turns busy work into progress.",
    instructions: [
      "Look back honestly at what you completed and what slipped.",
      "Write one practical improvement for next week."
    ],
    solution: [
      "A strong weekly reset does three things: acknowledge wins, identify friction, and set one small correction.",
      "Do not create a huge catch-up list. Pick the next actions that keep you moving."
    ],
    difficulty: "easy",
    questions: [
      {
        id: "m7-q1",
        prompt: "Which mission felt strongest this week, and why?",
        questionType: "long_text",
        placeholder: "Reflect on what clicked..."
      },
      {
        id: "m7-q2",
        prompt: "Which topic needs another round next week?",
        questionType: "long_text",
        placeholder: "Name the weak spot and why it felt difficult..."
      },
      {
        id: "m7-q3",
        prompt: "What is one change you will make to keep the 1-hour habit alive?",
        questionType: "long_text",
        placeholder: "Choose one concrete action..."
      }
    ]
  }
];
