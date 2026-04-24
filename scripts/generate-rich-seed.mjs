import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputPath = path.join(projectRoot, "supabase", "seed_rich_content.sql");

const mixedPlan = {
  name: "Placement Sprint Rich v1",
  slug: "placement-sprint-rich-v1",
  durationDays: 90,
  isActive: true
};

const aptitudeBankPlan = {
  name: "Placement Aptitude Bank 1000Q v1",
  slug: "placement-aptitude-bank-1000q-v1",
  durationDays: 100,
  isActive: false
};

function hash(seed) {
  const value = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  return value >>> 0;
}

function intBetween(seed, min, max, step = 1) {
  const total = Math.floor((max - min) / step) + 1;
  return min + (hash(seed) % total) * step;
}

function pick(seed, values) {
  return values[hash(seed) % values.length];
}

function formatNumber(value) {
  return Number.isInteger(value) ? `${value}` : `${Number(value.toFixed(1))}`;
}

function rotate(items, offset) {
  const start = ((offset % items.length) + items.length) % items.length;
  return items.slice(start).concat(items.slice(0, start));
}

function mcq(prompt, explanation, correct, distractors, seed) {
  const items = [
    { text: correct, isCorrect: true },
    ...distractors.map((text) => ({ text, isCorrect: false }))
  ];
  const unique = [];
  const seen = new Set();

  for (const item of items) {
    if (!seen.has(item.text)) {
      unique.push(item);
      seen.add(item.text);
    }
  }

  const options = rotate(unique, seed % 4).slice(0, 4);

  return {
    questionType: "mcq",
    prompt,
    explanation,
    sampleAnswer: "",
    sourcePlatform: null,
    sourceUrl: null,
    options
  };
}

function longQuestion({
  prompt,
  explanation,
  sampleAnswer,
  sourcePlatform = null,
  sourceUrl = null
}) {
  return {
    questionType: "long_text",
    prompt,
    explanation,
    sampleAnswer,
    sourcePlatform,
    sourceUrl,
    options: []
  };
}

function percentageText(value) {
  return `${formatNumber(value)}%`;
}

function moneyText(value) {
  return `Rs ${formatNumber(value)}`;
}

function secondsText(value) {
  return `${formatNumber(value)} sec`;
}

function minutesText(value) {
  return `${formatNumber(value)} min`;
}

function hoursText(value) {
  return `${formatNumber(value)} hours`;
}

function speedText(value) {
  return `${formatNumber(value)} km/h`;
}

function literText(value) {
  return `${formatNumber(value)} L`;
}

function ratioText(a, b) {
  return `${a}:${b}`;
}

function optionNumbers(answer, bumps, formatter) {
  return bumps.map((bump) => formatter(answer + bump));
}

function qPercentOfNumber(seed) {
  const pct = pick(seed + 1, [10, 15, 20, 25, 30, 35, 40]);
  const base = intBetween(seed + 2, 200, 620, 20);
  const answer = (base * pct) / 100;
  const distractors = optionNumbers(answer, [-pct, pct, pct + 10], formatNumber);

  return mcq(
    `What is ${pct}% of ${base}?`,
    `${pct}% means ${pct}/100. Multiply ${base} by ${pct} and divide by 100.`,
    formatNumber(answer),
    distractors,
    seed
  );
}

function qPercentIncrease(seed) {
  const base = intBetween(seed + 3, 80, 320, 20);
  const increase = pick(seed + 4, [10, 15, 20, 25, 30]);
  const finalValue = (base * (100 + increase)) / 100;
  const distractors = [
    percentageText(increase - 5),
    percentageText(increase + 5),
    percentageText(increase + 10)
  ];

  return mcq(
    `A value rises from ${base} to ${finalValue}. What is the percentage increase?`,
    `Increase = ${finalValue - base}. Percentage increase = increase / original x 100.`,
    percentageText(increase),
    distractors,
    seed
  );
}

function qBaseFromPercent(seed) {
  const original = intBetween(seed + 5, 180, 720, 12);
  const pct = pick(seed + 6, [20, 25, 30, 40, 50, 60, 75]);
  const part = (original * pct) / 100;
  const distractors = optionNumbers(original, [-24, 24, 48], formatNumber);

  return mcq(
    `If ${pct}% of a number is ${part}, what is the number?`,
    `Number = part / (${pct}/100).`,
    formatNumber(original),
    distractors,
    seed
  );
}

function qDiscountPercent(seed) {
  const marked = intBetween(seed + 7, 400, 1400, 20);
  const discount = pick(seed + 8, [10, 15, 20, 25, 30]);
  const selling = (marked * (100 - discount)) / 100;
  const distractors = [
    moneyText(selling - 20),
    moneyText(selling + 20),
    moneyText(selling + 40)
  ];

  return mcq(
    `An item marked at ${marked} is sold after a ${discount}% discount. What is the selling price?`,
    `Selling price = marked price x (100 - discount) / 100.`,
    moneyText(selling),
    distractors,
    seed
  );
}

function qMarkedPrice(seed) {
  const marked = intBetween(seed + 9, 500, 1600, 20);
  const discount = pick(seed + 10, [10, 15, 20, 25]);
  const selling = (marked * (100 - discount)) / 100;
  const distractors = optionNumbers(marked, [-40, 40, 80], moneyText);

  return mcq(
    `After a ${discount}% discount, an item sells for ${selling}. What was the marked price?`,
    `Sale price = marked price x (100 - discount) / 100, so marked price = sale price / remaining fraction.`,
    moneyText(marked),
    distractors,
    seed
  );
}

function qSuccessiveChange(seed) {
  const pair = pick(seed + 11, [
    [20, 10],
    [25, 20],
    [30, 10],
    [40, 25],
    [50, 20],
    [15, 10]
  ]);
  const [up, down] = pair;
  const net = up - down - (up * down) / 100;
  const label =
    net === 0 ? "No change" : `${formatNumber(Math.abs(net))}% ${net > 0 ? "increase" : "decrease"}`;
  const distractors = [
    `${formatNumber(Math.abs(up - down))}% ${up > down ? "increase" : "decrease"}`,
    `${formatNumber(Math.abs(net) + 1)}% ${net > 0 ? "increase" : "decrease"}`,
    net === 0 ? "1% decrease" : "No change"
  ];

  return mcq(
    `A price increases by ${up}% and then decreases by ${down}%. What is the net effect?`,
    `Use successive change: net % = a - b - ab/100.`,
    label,
    distractors,
    seed
  );
}

function qRatioShare(seed) {
  const ratio = pick(seed + 12, [
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 7],
    [7, 9],
    [8, 11]
  ]);
  const [a, b] = ratio;
  const total = (a + b) * intBetween(seed + 13, 12, 28, 2);
  const answer = (total * a) / (a + b);
  const distractors = optionNumbers(answer, [b, -(a + b), a + b], formatNumber);

  return mcq(
    `A sum of ${total} is divided in the ratio ${a}:${b}. What is the first share?`,
    `First share = total x first part / total parts.`,
    formatNumber(answer),
    distractors,
    seed
  );
}

function qRatioEquivalent(seed) {
  const gcd = pick(seed + 14, [2, 3, 4, 5, 6]);
  const left = gcd * pick(seed + 15, [3, 4, 5, 6, 7, 8]);
  const right = gcd * pick(seed + 16, [5, 6, 7, 8, 9, 10]);
  const answer = ratioText(left / gcd, right / gcd);
  const distractors = [
    ratioText(left / gcd + 1, right / gcd),
    ratioText(left / gcd, right / gcd + 1),
    ratioText(left / gcd + 1, right / gcd + 1)
  ];

  return mcq(
    `Simplify the ratio ${left}:${right}.`,
    `Divide both terms by their highest common factor.`,
    answer,
    distractors,
    seed
  );
}

function qDirectProportion(seed) {
  const notebooks = pick(seed + 17, [4, 5, 6, 8, 10, 12]);
  const price = notebooks * intBetween(seed + 18, 12, 28, 2);
  const newQty = notebooks + pick(seed + 19, [2, 4, 6, 8]);
  const answer = (price / notebooks) * newQty;
  const distractors = optionNumbers(answer, [-12, 12, 24], moneyText);

  return mcq(
    `${notebooks} notebooks cost ${price}. What will ${newQty} notebooks cost at the same rate?`,
    `Use direct proportion: unit price x required quantity.`,
    moneyText(answer),
    distractors,
    seed
  );
}

function qSpeedDistance(seed) {
  const speed = pick(seed + 20, [30, 36, 40, 45, 48, 54, 60]);
  const timeHours = pick(seed + 21, [2, 3, 4, 5]);
  const distance = speed * timeHours;
  const distractors = optionNumbers(speed, [-6, 6, 12], speedText);

  return mcq(
    `A vehicle covers ${distance} km in ${timeHours} hours. What is its speed?`,
    `Speed = distance / time.`,
    speedText(speed),
    distractors,
    seed
  );
}

function qTrainPole(seed) {
  const speed = pick(seed + 22, [36, 54, 72, 90]);
  const seconds = pick(seed + 23, [8, 10, 12, 15, 18]);
  const speedMps = (speed * 5) / 18;
  const length = speedMps * seconds;
  const distractors = optionNumbers(seconds, [-2, 2, 4], secondsText);

  return mcq(
    `A train ${length} m long runs at ${speed} km/h. In how many seconds will it cross a pole?`,
    `Time = train length / speed in m/s.`,
    secondsText(seconds),
    distractors,
    seed
  );
}

function qTrainPlatform(seed) {
  const speed = pick(seed + 24, [36, 54, 72, 90]);
  const speedMps = (speed * 5) / 18;
  const train = pick(seed + 25, [120, 150, 180, 210]);
  const platform = pick(seed + 26, [90, 120, 150, 180]);
  const seconds = (train + platform) / speedMps;
  const distractors = optionNumbers(seconds, [-3, 3, 6], secondsText);

  return mcq(
    `A ${train} m train crosses a ${platform} m platform at ${speed} km/h. How long does it take?`,
    `Add train and platform lengths, then divide by speed in m/s.`,
    secondsText(seconds),
    distractors,
    seed
  );
}

function qBoatStream(seed) {
  const still = pick(seed + 27, [12, 14, 16, 18, 20]);
  const stream = pick(seed + 28, [2, 3, 4, 5, 6]);
  const downstream = still + stream;
  const upstream = still - stream;
  const answerType = pick(seed + 29, ["still", "stream"]);

  if (answerType === "still") {
    return mcq(
      `A boat's downstream speed is ${downstream} km/h and upstream speed is ${upstream} km/h. What is the speed of the boat in still water?`,
      `Still-water speed = (downstream + upstream) / 2.`,
      speedText(still),
      [speedText(still - 2), speedText(still + 2), speedText(stream)],
      seed
    );
  }

  return mcq(
    `A boat's downstream speed is ${downstream} km/h and upstream speed is ${upstream} km/h. What is the speed of the stream?`,
    `Stream speed = (downstream - upstream) / 2.`,
    speedText(stream),
    [speedText(stream - 1), speedText(stream + 1), speedText(still - 2)],
    seed
  );
}

function qAverageSpeed(seed) {
  const pair = pick(seed + 30, [
    [24, 48],
    [30, 60],
    [36, 72],
    [45, 90],
    [54, 108]
  ]);
  const [first, second] = pair;
  const answer = (2 * first * second) / (first + second);
  const distractors = optionNumbers(answer, [-6, 6, 12], speedText);

  return mcq(
    `A traveler covers equal distances at ${first} km/h and ${second} km/h. What is the average speed?`,
    `For equal distances, average speed = 2ab / (a + b).`,
    speedText(answer),
    distractors,
    seed
  );
}

function qTimeWork(seed) {
  const pair = pick(seed + 31, [
    [6, 3],
    [8, 24],
    [10, 15],
    [12, 12],
    [12, 6]
  ]);
  const [aDays, bDays] = pair;
  const answer = (aDays * bDays) / (aDays + bDays);
  const distractors = [hoursText(answer - 1), hoursText(answer + 1), hoursText(answer + 2)];

  return mcq(
    `A can finish a job in ${aDays} days and B in ${bDays} days. In how many days can they finish it together?`,
    `Combined work rate = 1/${aDays} + 1/${bDays}. Take the reciprocal.`,
    hoursText(answer),
    distractors,
    seed
  );
}

function qProfitLoss(seed) {
  const cost = intBetween(seed + 32, 400, 1400, 20);
  const pct = pick(seed + 33, [10, 15, 20, 25, 30]);
  const isProfit = pick(seed + 34, [true, false]);
  const selling = isProfit
    ? (cost * (100 + pct)) / 100
    : (cost * (100 - pct)) / 100;
  const answer = `${pct}% ${isProfit ? "profit" : "loss"}`;
  const distractors = [
    `${pct - 5}% ${isProfit ? "profit" : "loss"}`,
    `${pct + 5}% ${isProfit ? "profit" : "loss"}`,
    `${pct}% ${isProfit ? "loss" : "profit"}`
  ];

  return mcq(
    `An item with cost price ${cost} is sold for ${selling}. What is the result?`,
    `Compare selling price with cost price and convert the difference into a percentage of cost price.`,
    answer,
    distractors,
    seed
  );
}

function qSimpleInterest(seed) {
  const principal = intBetween(seed + 35, 1000, 8000, 500);
  const rate = pick(seed + 36, [5, 6, 8, 10, 12]);
  const time = pick(seed + 37, [2, 3, 4, 5]);
  const interest = (principal * rate * time) / 100;
  const distractors = optionNumbers(interest, [-rate * 10, rate * 10, rate * 20], moneyText);

  return mcq(
    `Find the simple interest on ${principal} at ${rate}% per annum for ${time} years.`,
    `Simple interest = P x R x T / 100.`,
    moneyText(interest),
    distractors,
    seed
  );
}

const aptitudeFactories = {
  qPercentOfNumber,
  qPercentIncrease,
  qBaseFromPercent,
  qDiscountPercent,
  qMarkedPrice,
  qSuccessiveChange,
  qRatioShare,
  qRatioEquivalent,
  qDirectProportion,
  qSpeedDistance,
  qTrainPole,
  qTrainPlatform,
  qBoatStream,
  qAverageSpeed,
  qTimeWork,
  qProfitLoss,
  qSimpleInterest
};

const aptitudeThemes = [
  {
    title: "Percentages and Discounts Drill",
    topic: "percentages, discounts, marked price",
    motivation: "Small wins in arithmetic build confidence for every other round.",
    instructions: [
      "Answer all ten questions before checking the explanations.",
      "Write one-line working for each question so you can spot formula mistakes."
    ],
    solution: [
      "Review the shortcuts only after attempting the full set.",
      "Mark whether the mistake was concept, arithmetic, or speed related."
    ],
    factories: [
      "qPercentOfNumber",
      "qPercentIncrease",
      "qBaseFromPercent",
      "qDiscountPercent",
      "qMarkedPrice",
      "qSuccessiveChange",
      "qPercentOfNumber",
      "qPercentIncrease",
      "qBaseFromPercent",
      "qDiscountPercent"
    ]
  },
  {
    title: "Ratios and Shares Drill",
    topic: "ratio, share, direct proportion",
    motivation: "Ratios become easy when every problem is turned into parts.",
    instructions: [
      "Reduce the ratio first before doing any other calculation.",
      "Translate every statement into parts and total parts."
    ],
    solution: [
      "Most ratio errors come from skipping the total-parts step.",
      "Use a quick table if the question mixes two conditions."
    ],
    factories: [
      "qRatioShare",
      "qRatioEquivalent",
      "qDirectProportion",
      "qRatioShare",
      "qRatioEquivalent",
      "qDirectProportion",
      "qRatioShare",
      "qRatioEquivalent",
      "qDirectProportion",
      "qRatioShare"
    ]
  },
  {
    title: "Speed and Distance Drill",
    topic: "speed, distance, time, average speed",
    motivation: "Speed questions feel easier when units are handled early.",
    instructions: [
      "Write the unit before substituting values.",
      "For average speed, decide whether the trip uses equal distances or equal times."
    ],
    solution: [
      "Keep km/h to m/s conversions visible in rough work.",
      "For average speed, do not average the numbers blindly."
    ],
    factories: [
      "qSpeedDistance",
      "qAverageSpeed",
      "qSpeedDistance",
      "qAverageSpeed",
      "qSpeedDistance",
      "qAverageSpeed",
      "qSpeedDistance",
      "qAverageSpeed",
      "qSpeedDistance",
      "qAverageSpeed"
    ]
  },
  {
    title: "Trains and Relative Speed Drill",
    topic: "trains, poles, platforms, relative speed",
    motivation: "Diagramming the moving lengths saves a lot of confusion.",
    instructions: [
      "Convert speed into m/s before touching the train length.",
      "Use total length when a platform is involved."
    ],
    solution: [
      "Train questions are mostly unit conversion plus total distance.",
      "Opposite and same-direction movement change the relative speed."
    ],
    factories: [
      "qTrainPole",
      "qTrainPlatform",
      "qAverageSpeed",
      "qTrainPole",
      "qTrainPlatform",
      "qTrainPole",
      "qTrainPlatform",
      "qAverageSpeed",
      "qTrainPole",
      "qTrainPlatform"
    ]
  },
  {
    title: "Boats and Streams Drill",
    topic: "boats, streams, upstream, downstream",
    motivation: "Once still-water and stream speeds are separated, the puzzle becomes routine.",
    instructions: [
      "Write downstream and upstream equations explicitly.",
      "Keep the still-water and stream speeds as separate unknowns."
    ],
    solution: [
      "Use half-sum for still water and half-difference for stream speed.",
      "After that, distance and time use the same speed-distance formula."
    ],
    factories: [
      "qBoatStream",
      "qSpeedDistance",
      "qBoatStream",
      "qAverageSpeed",
      "qBoatStream",
      "qSpeedDistance",
      "qBoatStream",
      "qAverageSpeed",
      "qBoatStream",
      "qSpeedDistance"
    ]
  },
  {
    title: "Time and Work Drill",
    topic: "time and work, rates, combined efficiency",
    motivation: "Work-rate problems get lighter when every worker is reduced to one-day work.",
    instructions: [
      "Convert each worker into one-day work before combining them.",
      "Keep the total work as 1 unit unless the question needs a different base."
    ],
    solution: [
      "Do not add days directly; add rates.",
      "After finding the combined rate, take the reciprocal to get time."
    ],
    factories: [
      "qTimeWork",
      "qDirectProportion",
      "qTimeWork",
      "qTimeWork",
      "qDirectProportion",
      "qTimeWork",
      "qTimeWork",
      "qDirectProportion",
      "qTimeWork",
      "qTimeWork"
    ]
  },
  {
    title: "Profit, Loss and Interest Drill",
    topic: "profit, loss, simple interest",
    motivation: "Commercial maths gets faster once you keep cost price as the base.",
    instructions: [
      "Always compare gain or loss with cost price, not selling price.",
      "Use the standard simple interest formula before substituting values."
    ],
    solution: [
      "Most mistakes come from using the wrong base for the percentage.",
      "Interest questions reward clean substitution more than tricks."
    ],
    factories: [
      "qProfitLoss",
      "qSimpleInterest",
      "qProfitLoss",
      "qSimpleInterest",
      "qProfitLoss",
      "qSimpleInterest",
      "qProfitLoss",
      "qSimpleInterest",
      "qProfitLoss",
      "qSimpleInterest"
    ]
  },
  {
    title: "Mixed Quant Drill",
    topic: "percentages, ratio, speed, work, profit",
    motivation: "Mixed practice teaches fast recognition under time pressure.",
    instructions: [
      "Spend a few seconds deciding the concept before solving.",
      "Do not jump into arithmetic until you know the formula family."
    ],
    solution: [
      "Mixed sets are about recognition and calm switching between concepts.",
      "Keep a one-word label beside each question in your rough work."
    ],
    factories: [
      "qPercentOfNumber",
      "qRatioShare",
      "qSpeedDistance",
      "qTrainPole",
      "qBoatStream",
      "qTimeWork",
      "qProfitLoss",
      "qPercentIncrease",
      "qRatioEquivalent",
      "qSimpleInterest"
    ]
  },
  {
    title: "Advanced Percentages and Ratios Drill",
    topic: "successive change, ratios, markups",
    motivation: "These are the exact spots where rushed solving usually breaks down.",
    instructions: [
      "Pause before the first step and identify the base quantity.",
      "Rewrite the ratio question in part form if it feels abstract."
    ],
    solution: [
      "Successive change is rarely equal to simple subtraction.",
      "Ratios become manageable once total parts are clear."
    ],
    factories: [
      "qSuccessiveChange",
      "qBaseFromPercent",
      "qRatioShare",
      "qPercentIncrease",
      "qDirectProportion",
      "qMarkedPrice",
      "qSuccessiveChange",
      "qBaseFromPercent",
      "qRatioEquivalent",
      "qPercentIncrease"
    ]
  },
  {
    title: "Speed, Boats and Work Mixer",
    topic: "speed, trains, boats, work",
    motivation: "The tougher sets feel lighter when the setup is written clearly.",
    instructions: [
      "Underline the unit and what the question is asking.",
      "Write a mini equation before doing the final calculation."
    ],
    solution: [
      "These concepts look different on the surface but all reward clean setup.",
      "Once the equation is right, the arithmetic is usually short."
    ],
    factories: [
      "qSpeedDistance",
      "qTrainPlatform",
      "qBoatStream",
      "qAverageSpeed",
      "qTimeWork",
      "qSpeedDistance",
      "qTrainPole",
      "qBoatStream",
      "qAverageSpeed",
      "qTimeWork"
    ]
  }
];

const dsaPracticeDays = [
  {
    title: "Arrays and Hashing Pair",
    topic: "arrays, hashing",
    easy: {
      title: "Two Sum",
      statement:
        "Given an integer array and a target value, return the indices of the two numbers whose sum matches the target.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/two-sum/"
    },
    medium: {
      title: "Group Anagrams",
      statement:
        "Given a list of strings, group together the words that are anagrams of each other.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/group-anagrams/"
    }
  },
  {
    title: "Strings and Window Pair",
    topic: "strings, sliding window",
    easy: {
      title: "Valid Anagram",
      statement:
        "Given two strings, decide whether one can be formed by rearranging the letters of the other.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/valid-anagram/"
    },
    medium: {
      title: "Longest Substring Without Repeating Characters",
      statement:
        "Find the length of the longest substring in a string that contains no repeated characters.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
    }
  },
  {
    title: "Stack Pattern Pair",
    topic: "stack, monotonic stack",
    easy: {
      title: "Valid Parentheses",
      statement:
        "Given a string of brackets, determine whether the brackets are balanced and properly nested.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/valid-parentheses/"
    },
    medium: {
      title: "Daily Temperatures",
      statement:
        "For each day's temperature, find how many days you must wait to encounter a warmer temperature.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/daily-temperatures/"
    }
  },
  {
    title: "Binary Search Pair",
    topic: "binary search",
    easy: {
      title: "Binary Search",
      statement:
        "Given a sorted array and a target, return the index of the target or -1 if it is not present.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/binary-search/"
    },
    medium: {
      title: "Search in Rotated Sorted Array",
      statement:
        "Search for a target in a sorted array that has been rotated at an unknown pivot.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/search-in-rotated-sorted-array/"
    }
  },
  {
    title: "Linked List Pair",
    topic: "linked list",
    easy: {
      title: "Reverse Linked List",
      statement:
        "Reverse a singly linked list and return the new head pointer.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/reverse-linked-list/"
    },
    medium: {
      title: "Detect Loop in Linked List",
      statement:
        "Given the head of a linked list, detect whether the list contains a cycle.",
      platform: "geeksforgeeks",
      url: "https://www.geeksforgeeks.org/detect-loop-in-linked-list/"
    }
  },
  {
    title: "Trees Pair",
    topic: "binary tree, BST",
    easy: {
      title: "Maximum Depth of Binary Tree",
      statement:
        "Return the number of nodes on the longest path from the root of a binary tree down to a leaf.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
    },
    medium: {
      title: "Validate Binary Search Tree",
      statement:
        "Determine whether a binary tree satisfies the ordering rules of a valid binary search tree.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/validate-binary-search-tree/"
    }
  },
  {
    title: "DFS and BFS Pair",
    topic: "grid traversal",
    easy: {
      title: "Flood Fill",
      statement:
        "Starting from one cell in an image grid, recolor the connected region that shares the starting color.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/flood-fill/"
    },
    medium: {
      title: "Number of Islands",
      statement:
        "Count how many disconnected groups of land exist in a 2D grid of water and land.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/number-of-islands/"
    }
  },
  {
    title: "Array Patterns Pair",
    topic: "prefix count, buckets",
    easy: {
      title: "Best Time to Buy and Sell Stock",
      statement:
        "Given daily stock prices, find the maximum profit possible with exactly one buy and one sell.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
    },
    medium: {
      title: "Top K Frequent Elements",
      statement:
        "Given an integer array, return the k values that appear most frequently.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/top-k-frequent-elements/"
    }
  },
  {
    title: "Prefix Sum Pair",
    topic: "prefix sum, hashing",
    easy: {
      title: "Find Pivot Index",
      statement:
        "Return an index where the sum of elements on the left equals the sum of elements on the right.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/find-pivot-index/"
    },
    medium: {
      title: "Subarray Sum Equals K",
      statement:
        "Count the number of continuous subarrays whose sum is exactly k.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/subarray-sum-equals-k/"
    }
  },
  {
    title: "Greedy Pair",
    topic: "greedy, reachability",
    easy: {
      title: "Find the Town Judge",
      statement:
        "In a town where the judge trusts nobody and everybody else trusts the judge, find the judge if one exists.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/find-the-town-judge/"
    },
    medium: {
      title: "Jump Game",
      statement:
        "Given jump lengths at each array index, determine whether you can reach the final index.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/jump-game/"
    }
  },
  {
    title: "Dynamic Programming Pair",
    topic: "DP foundations",
    easy: {
      title: "Climbing Stairs",
      statement:
        "Count how many distinct ways you can reach the top of a staircase when you can climb 1 or 2 steps at a time.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/climbing-stairs/"
    },
    medium: {
      title: "Coin Change",
      statement:
        "Given coin denominations and a target amount, find the minimum number of coins needed to make that amount.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/coin-change/"
    }
  },
  {
    title: "List and Queue Pair",
    topic: "lists, BFS",
    easy: {
      title: "Merge Two Sorted Lists",
      statement:
        "Merge two sorted linked lists into one sorted linked list.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/merge-two-sorted-lists/"
    },
    medium: {
      title: "Rotting Oranges",
      statement:
        "Given a grid of fresh and rotten oranges, compute how many minutes it takes for all reachable fresh oranges to rot.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/rotting-oranges/"
    }
  },
  {
    title: "Tree and Backtracking Pair",
    topic: "trees, backtracking",
    easy: {
      title: "Symmetric Tree",
      statement:
        "Check whether a binary tree is a mirror image of itself around its center.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/symmetric-tree/"
    },
    medium: {
      title: "Letter Combinations of a Phone Number",
      statement:
        "Return all possible letter combinations that a phone keypad could generate for the given digits.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/"
    }
  }
];

const sqlPracticeDays = [
  {
    title: "Filters and Ranking Pair",
    topic: "basic filtering, ranking",
    easy: {
      title: "Recyclable and Low Fat Products",
      statement:
        "Return the product IDs for items that are both recyclable and low fat.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/recyclable-and-low-fat-products/"
    },
    medium: {
      title: "Second Highest Salary",
      statement:
        "Write a query to return the second highest distinct salary from the employee table.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/second-highest-salary/"
    }
  },
  {
    title: "Simple Selects Pair",
    topic: "filters, ranking",
    easy: {
      title: "Big Countries",
      statement:
        "Return countries whose area or population crosses the large-country threshold.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/big-countries/"
    },
    medium: {
      title: "Rank Scores",
      statement:
        "Assign dense ranks to scores ordered from highest to lowest.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/rank-scores/"
    }
  },
  {
    title: "Validation and Sequences Pair",
    topic: "strings, sequence detection",
    easy: {
      title: "Invalid Tweets",
      statement:
        "Find tweet IDs where the content exceeds the allowed character limit.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/invalid-tweets/"
    },
    medium: {
      title: "Consecutive Numbers",
      statement:
        "Return values that appear at least three times in a row in the logs table.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/consecutive-numbers/"
    }
  },
  {
    title: "Missing Data Pair",
    topic: "joins, salary ranking",
    easy: {
      title: "Customers Who Never Order",
      statement:
        "List customers who have no matching order record.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/customers-who-never-order/"
    },
    medium: {
      title: "Nth Highest Salary",
      statement:
        "Write a query or function that returns the Nth highest distinct salary.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/nth-highest-salary/"
    }
  },
  {
    title: "Joins and Seat Swap Pair",
    topic: "left join, windowing",
    easy: {
      title: "Employee Bonus",
      statement:
        "Return employees whose bonus is either below the threshold or missing entirely.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/employee-bonus/"
    },
    medium: {
      title: "Exchange Seats",
      statement:
        "Swap every pair of adjacent students in the seat table while keeping an odd last seat unchanged.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/exchange-seats/"
    }
  },
  {
    title: "Conditions and Rates Pair",
    topic: "conditional filters, aggregates",
    easy: {
      title: "Find Customer Referee",
      statement:
        "Return customers who were not referred by the blocked referee ID.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/find-customer-referee/"
    },
    medium: {
      title: "Confirmation Rate",
      statement:
        "Compute each user's confirmation rate using requested and confirmed sign-up actions.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/confirmation-rate/"
    }
  },
  {
    title: "Sales and Delivery Pair",
    topic: "joins, conditional logic",
    easy: {
      title: "Product Sales Analysis I",
      statement:
        "Return the product name, year, and price for each recorded sale.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/product-sales-analysis-i/"
    },
    medium: {
      title: "Immediate Food Delivery II",
      statement:
        "Calculate the percentage of first orders that were delivered on the preferred date.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/immediate-food-delivery-ii/"
    }
  },
  {
    title: "Identifiers and Monthly Reports Pair",
    topic: "joins, monthly grouping",
    easy: {
      title: "Replace Employee ID With The Unique Identifier",
      statement:
        "Join employee names with their unique identifiers while keeping employees even if the identifier is missing.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/"
    },
    medium: {
      title: "Monthly Transactions I",
      statement:
        "Summarize approved transaction counts and amounts by month and country.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/monthly-transactions-i/"
    }
  },
  {
    title: "Views and Rolling Sums Pair",
    topic: "aggregates, windows",
    easy: {
      title: "Article Views I",
      statement:
        "Return authors who viewed at least one of their own articles.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/article-views-i/"
    },
    medium: {
      title: "Restaurant Growth",
      statement:
        "Compute the 7-day rolling sum and average revenue for the restaurant table.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/restaurant-growth/"
    }
  },
  {
    title: "String Filters and Retention Pair",
    topic: "pattern filter, retention",
    easy: {
      title: "Patients With a Condition",
      statement:
        "Return patients whose condition list contains the target diabetes code as a full token.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/patients-with-a-condition/"
    },
    medium: {
      title: "Game Play Analysis IV",
      statement:
        "Calculate the fraction of players who returned the day after their first login.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/game-play-analysis-iv/"
    }
  },
  {
    title: "Manager Checks and Running Total Pair",
    topic: "filters, running logic",
    easy: {
      title: "Employees Whose Manager Left the Company",
      statement:
        "Return employees whose manager ID is set but the manager record no longer exists, subject to salary rules.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/employees-whose-manager-left-the-company/"
    },
    medium: {
      title: "Last Person to Fit in the Bus",
      statement:
        "Using passenger weights in boarding order, find the last person who can board without crossing the weight limit.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/last-person-to-fit-in-the-bus/"
    }
  },
  {
    title: "Visit Gaps and Ranking Pair",
    topic: "left join, grouped ranking",
    easy: {
      title: "Customer Who Visited but Did Not Make Any Transactions",
      statement:
        "Count how many visits each customer made without completing a transaction.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/"
    },
    medium: {
      title: "Movie Rating",
      statement:
        "Return the user with the most ratings and the movie with the highest average rating in the target month.",
      platform: "leetcode",
      url: "https://leetcode.com/problems/movie-rating/"
    }
  },
  {
    title: "Salary Articles Pair",
    topic: "salary ranking practice",
    easy: {
      title: "SQL Query to Find Second Largest Salary",
      statement:
        "Write a query that returns the second highest distinct salary from an employee salary table.",
      platform: "geeksforgeeks",
      url: "https://www.geeksforgeeks.org/sql-query-to-find-second-largest-salary/"
    },
    medium: {
      title: "SQL Query to Find Nth Highest Salary",
      statement:
        "Generalize the salary-ranking pattern to return the Nth highest distinct salary.",
      platform: "geeksforgeeks",
      url: "https://www.geeksforgeeks.org/sql-query-to-find-nth-highest-salary/"
    }
  }
];

const hrPracticeDays = [
  {
    title: "Tell Me About Yourself Lab",
    topic: "self introduction",
    questions: [
      [
        "Tell me about yourself in under 90 seconds.",
        "Open with your present role or education, then move to strengths, a proof point, and your target role.",
        "Start with where you are now, mention one project or internship, highlight 2 strengths, and close with why this role fits."
      ],
      [
        "What should we remember about you after this interview?",
        "Choose one memorable strength and support it with a real example.",
        "Pick one anchor trait such as consistency, ownership, or fast learning, and support it with one concrete incident."
      ],
      [
        "Which part of your background prepared you best for placements?",
        "Focus on practice habits, projects, internships, or team work.",
        "Mention one specific preparation habit and the result it created."
      ],
      [
        "How do you introduce yourself differently for technical and HR rounds?",
        "Show that you can adapt the same story to different listeners.",
        "For technical rounds, lead with projects and problem solving. For HR rounds, lead with growth, values, and fit."
      ]
    ]
  },
  {
    title: "Strengths and Weaknesses Lab",
    topic: "self awareness",
    questions: [
      [
        "What is your biggest professional strength?",
        "Pick one strength that matters to entry-level hiring and prove it with a real example.",
        "State the strength, explain where it helped, and describe the outcome."
      ],
      [
        "Which weakness are you actively improving?",
        "Choose a real but safe weakness and focus on how you are improving it.",
        "Mention the weakness briefly, then spend most of the answer on your improvement system."
      ],
      [
        "How do your classmates or teammates usually describe you?",
        "Use outside perception to add credibility to your self-assessment.",
        "Pick 2 recurring adjectives and support them with a team example."
      ],
      [
        "What skill do you want to become known for in the next year?",
        "Connect the answer to the job and your current learning path.",
        "Choose one skill, say why it matters, and explain what you are doing weekly to strengthen it."
      ]
    ]
  },
  {
    title: "Project Walkthrough Lab",
    topic: "project communication",
    questions: [
      [
        "Walk me through your strongest project.",
        "Use a simple structure: problem, your role, key decisions, outcome.",
        "Explain the problem first, then your exact ownership, the technical decisions, and the result."
      ],
      [
        "What trade-off did you make in that project?",
        "Good project answers show judgment, not just feature building.",
        "Name two options, explain why you chose one, and mention what you gave up."
      ],
      [
        "What would you improve if you had one more week?",
        "Reflect honestly and focus on the next most valuable improvement.",
        "Choose one improvement that meaningfully increases reliability, usability, or scale."
      ],
      [
        "How did you measure whether your project worked?",
        "Think in terms of users, speed, correctness, or adoption.",
        "State the success metric, how you checked it, and what the result showed."
      ]
    ]
  },
  {
    title: "Teamwork and Conflict Lab",
    topic: "team behavior",
    questions: [
      [
        "Describe a time you had a disagreement in a team.",
        "Use a calm example and show how you moved the discussion toward a decision.",
        "Explain the disagreement, how you listened, how you responded, and what the team achieved."
      ],
      [
        "How do you handle a teammate who is not delivering?",
        "Show maturity, clarity, and support before escalation.",
        "Start with understanding the blocker, align on expectations, offer help, and escalate only when necessary."
      ],
      [
        "What role do you naturally play in group work?",
        "Reflect on whether you are usually the planner, builder, coordinator, or quality checker.",
        "Choose one role and support it with a real team example."
      ],
      [
        "Tell me about a time you helped someone else succeed.",
        "Strong collaboration answers are specific and outcome focused.",
        "Describe the context, the support you gave, and the positive impact on the teammate or group."
      ]
    ]
  },
  {
    title: "Ownership and Initiative Lab",
    topic: "ownership",
    questions: [
      [
        "Tell me about a time you took initiative without being asked.",
        "Focus on the problem you noticed, the action you started, and the value created.",
        "Show that you can move from observation to action without waiting for instructions."
      ],
      [
        "How do you decide what to do first when many things are pending?",
        "Talk about urgency, importance, dependency, and impact.",
        "Explain your prioritization rule with one example."
      ],
      [
        "What does ownership mean to you in an entry-level role?",
        "Keep the answer practical: reliability, follow-through, and visibility.",
        "Ownership means not just starting work, but closing loops and communicating progress clearly."
      ],
      [
        "Describe a time you fixed a recurring problem.",
        "A good answer shows root-cause thinking rather than repeated patching.",
        "State the recurring issue, what pattern you noticed, what change you made, and the result."
      ]
    ]
  },
  {
    title: "Deadlines and Pressure Lab",
    topic: "pressure handling",
    questions: [
      [
        "Describe a time you worked under a tight deadline.",
        "Choose a real example and show how you structured the work under pressure.",
        "Mention the deadline, the plan, communication, and result."
      ],
      [
        "How do you stay calm when work piles up?",
        "Show your method, not just your intention.",
        "Discuss how you break work into smaller parts, set checkpoints, and keep communication clear."
      ],
      [
        "What do you do when you realize you may miss a deadline?",
        "Strong answers show early visibility and recovery planning.",
        "Explain how you raise the risk early, propose options, and protect the highest-priority outcome."
      ],
      [
        "How do you avoid low-quality work when moving fast?",
        "Talk about a short checklist, peer review, or test habit.",
        "Mention the quality guardrail you never skip even under time pressure."
      ]
    ]
  },
  {
    title: "Failure and Learning Lab",
    topic: "learning from setbacks",
    questions: [
      [
        "Tell me about a failure and what changed after it.",
        "Choose a real setback and focus on reflection plus behavior change.",
        "Explain the failure honestly, then spend more time on what you changed next."
      ],
      [
        "When did you receive difficult feedback, and how did you respond?",
        "Feedback answers should show openness, not defensiveness.",
        "Share the feedback, your first reaction, the action you took, and the later improvement."
      ],
      [
        "What is one mistake you do not repeat anymore?",
        "Choose something that shows growth and maturity.",
        "Describe the old pattern, the lesson, and the new system you use."
      ],
      [
        "How do you learn when something feels difficult at first?",
        "Explain your learning loop, especially when motivation is low.",
        "Talk about breaking the topic into smaller parts, consistent practice, and asking focused questions."
      ]
    ]
  },
  {
    title: "Leadership and Collaboration Lab",
    topic: "leadership",
    questions: [
      [
        "Describe a time you led a small effort or task.",
        "Leadership at your stage can be coordination, not just authority.",
        "Explain the goal, how you aligned people, and how you kept momentum."
      ],
      [
        "How do you make sure everyone stays aligned in a team?",
        "Communication clarity matters more than fancy tools here.",
        "Talk about shared goals, written checkpoints, and explicit next steps."
      ],
      [
        "What do you do if two team members are pulling in different directions?",
        "The goal is to bring the discussion back to facts, priorities, and shared goals.",
        "Show how you listen, clarify the disagreement, and move toward one decision."
      ],
      [
        "What is the difference between being helpful and being controlling in a team?",
        "This checks awareness of healthy teamwork boundaries.",
        "Helpful means enabling others and clarifying outcomes; controlling means removing autonomy unnecessarily."
      ]
    ]
  },
  {
    title: "Why This Role Lab",
    topic: "motivation and fit",
    questions: [
      [
        "Why do you want this role?",
        "Keep it specific to the role, learning curve, and your strengths.",
        "Connect your interest, preparation, and what excites you about the work."
      ],
      [
        "Why should we hire you as an entry-level candidate?",
        "Focus on learning ability, discipline, ownership, and technical base.",
        "Show how your current strengths reduce ramp-up time and increase reliability."
      ],
      [
        "What kind of environment helps you do your best work?",
        "Choose a real preference but stay flexible.",
        "Explain the environment and why it helps you learn and contribute faster."
      ],
      [
        "What are you looking for in your first job?",
        "Think beyond salary: mentorship, challenging work, growth, and clarity.",
        "Mention 2 or 3 things that genuinely matter to you and tie them to long-term growth."
      ]
    ]
  },
  {
    title: "Resume Deep Dive Lab",
    topic: "resume storytelling",
    questions: [
      [
        "Which line on your resume are you most ready to defend deeply?",
        "Choose the strongest line and be ready to go into detail.",
        "State the resume point, what you truly owned, and the measurable result."
      ],
      [
        "If I remove one line from your resume, which one should stay and why?",
        "This reveals what you think best represents your value.",
        "Pick the line that best combines skill, ownership, and evidence."
      ],
      [
        "What on your resume usually gets misunderstood?",
        "Clarify vague or inflated language proactively.",
        "Name the line, explain the actual scope, and restate it more clearly."
      ],
      [
        "What is one resume point you would rewrite today?",
        "Show self-awareness and better communication.",
        "Explain how you would make the point clearer, more honest, or more outcome focused."
      ]
    ]
  },
  {
    title: "Communication and Stakeholder Lab",
    topic: "communication",
    questions: [
      [
        "How do you explain a technical issue to a non-technical person?",
        "The key is clear structure, not jargon.",
        "Start with the user impact, then explain the cause in simple terms, and end with the fix or next step."
      ],
      [
        "Tell me about a time you had to clarify ambiguity.",
        "Strong candidates reduce confusion early instead of guessing silently.",
        "Explain the ambiguity, the questions you asked, and how that improved the outcome."
      ],
      [
        "How do you give progress updates when work is still in motion?",
        "Think in terms of status, blockers, next step, and ETA.",
        "Use a short update structure: done, in progress, risk, next."
      ],
      [
        "What makes communication trustworthy in a team?",
        "Trustworthy communication is timely, specific, and honest about risks.",
        "Highlight clarity, consistency, and early visibility of blockers."
      ]
    ]
  },
  {
    title: "Ethics and Tough Decisions Lab",
    topic: "ethics",
    questions: [
      [
        "What would you do if someone asked you to hide a mistake?",
        "Use a calm answer that protects trust and accountability.",
        "State that you would not hide it, would surface the issue early, and help fix it responsibly."
      ],
      [
        "How do you respond when you disagree with a decision but still need to execute it?",
        "Show that you can disagree respectfully and align once the path is clear.",
        "Present your view with reasons, then commit to the final direction after the decision is made."
      ],
      [
        "What would you do if you found a quality issue right before release?",
        "Think in terms of risk visibility and trade-offs, not panic.",
        "Explain how you would assess severity, escalate quickly, and recommend the safest path."
      ],
      [
        "How do you balance speed and correctness?",
        "There is no perfect answer, only clearer trade-offs.",
        "Discuss impact, reversibility, testing, and stakeholder awareness."
      ]
    ]
  },
  {
    title: "Final Mock HR Round",
    topic: "mock interview",
    questions: [
      [
        "Give your best 60-second pitch for why you are ready for placements now.",
        "Blend preparation, examples, and confidence without sounding rehearsed.",
        "Mention your strongest preparation habits, one proof point, and the type of role you are targeting."
      ],
      [
        "What is the clearest proof that you follow through on commitments?",
        "Choose one habit or project with visible consistency.",
        "Explain the commitment, how you maintained it, and the result."
      ],
      [
        "If selected, how will you make your first 90 days count?",
        "Show realism, humility, and structured ramp-up thinking.",
        "Talk about understanding context, shipping reliable work, and learning fast from feedback."
      ],
      [
        "What final message would you want the interviewer to remember?",
        "Close with clarity, not repetition.",
        "Summarize the one or two strengths that best fit the role and why they matter."
      ]
    ]
  }
];

function platformLabel(platform) {
  if (platform === "leetcode") {
    return "LeetCode";
  }

  if (platform === "geeksforgeeks" || platform === "gfg") {
    return "GeeksforGeeks";
  }

  return "practice site";
}

function difficultyForVariant(variant) {
  if (variant <= 3) {
    return "easy";
  }

  if (variant <= 7) {
    return "medium";
  }

  return "hard";
}

function buildAptitudeDay(dayNumber) {
  const theme = aptitudeThemes[(dayNumber - 1) % aptitudeThemes.length];
  const variant = Math.floor((dayNumber - 1) / aptitudeThemes.length) + 1;
  const difficulty = difficultyForVariant(variant);
  const questions = theme.factories.map((factoryName, index) => {
    const factory = aptitudeFactories[factoryName];
    const seed = dayNumber * 100 + (index + 1) * 17 + variant * 29;
    return factory(seed);
  });

  return {
    dayNumber,
    weekNumber: Math.floor((dayNumber - 1) / 7) + 1,
    taskType: "aptitude",
    title: `${theme.title} ${variant}`,
    topic: theme.topic,
    estimatedMinutes: 60,
    motivationCopy: theme.motivation,
    instructions: theme.instructions,
    solution: theme.solution,
    difficulty,
    questions
  };
}

function buildDsaDay(dayNumber, pairIndex) {
  const pair = dsaPracticeDays[pairIndex];

  return {
    dayNumber,
    weekNumber: Math.floor((dayNumber - 1) / 7) + 1,
    taskType: "dsa",
    title: pair.title,
    topic: pair.topic,
    estimatedMinutes: 60,
    motivationCopy: "Attempt both external problems first, then come back and write clean notes.",
    instructions: [
      "Open the easy problem first and solve it without reading editorials.",
      "Then solve the medium problem and record your final approach, complexity, and one tricky edge case."
    ],
    solution: [
      "For each problem, write the brute-force idea, optimized idea, time complexity, and space complexity.",
      "If you got stuck, note the exact point of confusion so the next revisit is easier."
    ],
    difficulty: "medium",
    questions: [
      longQuestion({
        prompt: `${pair.easy.title} (Easy). ${pair.easy.statement}`,
        explanation: `Open the ${platformLabel(pair.easy.platform)} problem in a new tab. Solve it first, then summarize your approach here.`,
        sampleAnswer:
          "Write the brute-force idea, final approach, time complexity, space complexity, and one edge case.",
        sourcePlatform: pair.easy.platform,
        sourceUrl: pair.easy.url
      }),
      longQuestion({
        prompt: `${pair.medium.title} (Medium). ${pair.medium.statement}`,
        explanation: `Solve this on ${platformLabel(pair.medium.platform)} before checking any discussion. Then explain the pattern you used.`,
        sampleAnswer:
          "Write the data structure or pattern used, why it works, complexity, and what made the medium version harder.",
        sourcePlatform: pair.medium.platform,
        sourceUrl: pair.medium.url
      })
    ]
  };
}

function buildSqlDay(dayNumber, pairIndex) {
  const pair = sqlPracticeDays[pairIndex];

  return {
    dayNumber,
    weekNumber: Math.floor((dayNumber - 1) / 7) + 1,
    taskType: "sql",
    title: pair.title,
    topic: pair.topic,
    estimatedMinutes: 55,
    motivationCopy: "Write the query yourself before checking any reference answer.",
    instructions: [
      "Solve the easy query first and make sure you understand the table relationship or filter.",
      "Then solve the medium query and note the join, grouping, ranking, or window logic you used."
    ],
    solution: [
      "After solving externally, come back and record the clean query pattern in your own words.",
      "If the medium problem uses ranking or grouping, note why that approach is safer than the first idea that came to mind."
    ],
    difficulty: "medium",
    questions: [
      longQuestion({
        prompt: `${pair.easy.title} (Easy). ${pair.easy.statement}`,
        explanation: `Open the ${platformLabel(pair.easy.platform)} problem, write the query, and then summarize the SQL pattern here.`,
        sampleAnswer:
          "Paste the final query or describe the filter/join used and why that query returns the correct rows.",
        sourcePlatform: pair.easy.platform,
        sourceUrl: pair.easy.url
      }),
      longQuestion({
        prompt: `${pair.medium.title} (Medium). ${pair.medium.statement}`,
        explanation: `Solve this on ${platformLabel(pair.medium.platform)} first. Then explain the ranking, grouping, or subquery idea in your own words.`,
        sampleAnswer:
          "Write the query, then add a short note about the main SQL trick such as DENSE_RANK, subquery filtering, or conditional aggregation.",
        sourcePlatform: pair.medium.platform,
        sourceUrl: pair.medium.url
      })
    ]
  };
}

function buildHrDay(dayNumber, index) {
  const pack = hrPracticeDays[index];

  return {
    dayNumber,
    weekNumber: Math.floor((dayNumber - 1) / 7) + 1,
    taskType: "hr",
    title: pack.title,
    topic: pack.topic,
    estimatedMinutes: 45,
    motivationCopy: "Clear, structured answers are a skill you can practice just like coding.",
    instructions: [
      "Answer every prompt in your own words before reading the sample guidance.",
      "Keep answers specific, short, and anchored in real experience where possible."
    ],
    solution: [
      "Review your answers for structure, evidence, and clarity rather than trying to sound perfect.",
      "If an answer feels weak, rewrite only the opening and closing lines first."
    ],
    difficulty: "easy",
    questions: pack.questions.map(([prompt, explanation, sampleAnswer]) =>
      longQuestion({
        prompt,
        explanation,
        sampleAnswer
      })
    )
  };
}

function buildMixedPlanDays() {
  const pattern = [
    "aptitude",
    "aptitude",
    "dsa",
    "sql",
    "aptitude",
    "hr",
    "aptitude"
  ];

  let aptitudeIndex = 1;
  let dsaIndex = 0;
  let sqlIndex = 0;
  let hrIndex = 0;

  return Array.from({ length: 90 }, (_, offset) => {
    const dayNumber = offset + 1;
    const taskType = pattern[offset % pattern.length];

    if (taskType === "aptitude") {
      const day = buildAptitudeDay(aptitudeIndex);
      aptitudeIndex += 1;
      return { ...day, dayNumber, weekNumber: Math.floor((dayNumber - 1) / 7) + 1 };
    }

    if (taskType === "dsa") {
      const day = buildDsaDay(dayNumber, dsaIndex);
      dsaIndex += 1;
      return day;
    }

    if (taskType === "sql") {
      const day = buildSqlDay(dayNumber, sqlIndex);
      sqlIndex += 1;
      return day;
    }

    const day = buildHrDay(dayNumber, hrIndex);
    hrIndex += 1;
    return day;
  });
}

function buildAptitudeBankDays() {
  return Array.from({ length: 100 }, (_, index) => buildAptitudeDay(index + 1));
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNullable(value) {
  return value == null ? "null" : sqlString(value);
}

function sqlTuple(values) {
  return `(${values.join(", ")})`;
}

function serializePlanDays(plan, days) {
  const rows = days.map((day) =>
    sqlTuple([
      `${day.dayNumber}`,
      `${day.weekNumber}`,
      sqlString(day.taskType),
      sqlString(day.title),
      sqlString(day.motivationCopy),
      `${day.estimatedMinutes}`,
      "true"
    ])
  );

  return `
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
  seed.is_published
from public.plan_templates pt
join (
  values
${rows.map((row) => `    ${row}`).join(",\n")}
) as seed(day_number, week_number, theme, title, motivation_copy, estimated_minutes, is_published)
  on true
where pt.slug = ${sqlString(plan.slug)}
on conflict (plan_template_id, day_number) do update
set
  week_number = excluded.week_number,
  theme = excluded.theme,
  title = excluded.title,
  motivation_copy = excluded.motivation_copy,
  estimated_minutes = excluded.estimated_minutes,
  is_published = excluded.is_published;`;
}

function serializeTasks(plan, days) {
  const rows = days.map((day) =>
    sqlTuple([
      `${day.dayNumber}`,
      sqlString(day.taskType),
      sqlString(day.title),
      sqlString(day.topic),
      sqlString(day.instructions.join("\n\n")),
      sqlString(day.solution.join("\n\n")),
      `${day.estimatedMinutes}`,
      sqlString(day.difficulty)
    ])
  );

  return `
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
  seed.task_type,
  seed.title,
  seed.topic,
  seed.instructions_md,
  seed.solution_md,
  seed.estimated_minutes,
  seed.difficulty,
  true
from public.plan_days pd
join public.plan_templates pt on pt.id = pd.plan_template_id
join (
  values
${rows.map((row) => `    ${row}`).join(",\n")}
) as seed(day_number, task_type, title, topic, instructions_md, solution_md, estimated_minutes, difficulty)
  on seed.day_number = pd.day_number
where pt.slug = ${sqlString(plan.slug)}
on conflict (plan_day_id) do update
set
  task_type = excluded.task_type,
  title = excluded.title,
  topic = excluded.topic,
  instructions_md = excluded.instructions_md,
  solution_md = excluded.solution_md,
  estimated_minutes = excluded.estimated_minutes,
  difficulty = excluded.difficulty,
  is_active = excluded.is_active;`;
}

function serializeQuestions(plan, days) {
  const rows = [];

  for (const day of days) {
    day.questions.forEach((question, index) => {
      rows.push(
        sqlTuple([
          `${day.dayNumber}`,
          `${index + 1}`,
          sqlString(question.prompt),
          sqlString(question.questionType),
          sqlString(question.explanation || ""),
          sqlString(question.sampleAnswer || ""),
          sqlNullable(question.sourcePlatform),
          sqlNullable(question.sourceUrl)
        ])
      );
    });
  }

  return `
insert into public.task_questions (
  task_id,
  position,
  prompt_md,
  question_type,
  explanation_md,
  sample_answer_md,
  source_platform,
  source_url
)
select
  t.id,
  seed.position,
  seed.prompt_md,
  seed.question_type,
  seed.explanation_md,
  seed.sample_answer_md,
  seed.source_platform,
  seed.source_url
from public.tasks t
join public.plan_days pd on pd.id = t.plan_day_id
join public.plan_templates pt on pt.id = pd.plan_template_id
join (
  values
${rows.map((row) => `    ${row}`).join(",\n")}
) as seed(day_number, position, prompt_md, question_type, explanation_md, sample_answer_md, source_platform, source_url)
  on seed.day_number = pd.day_number
where pt.slug = ${sqlString(plan.slug)}
on conflict (task_id, position) do update
set
  prompt_md = excluded.prompt_md,
  question_type = excluded.question_type,
  explanation_md = excluded.explanation_md,
  sample_answer_md = excluded.sample_answer_md,
  source_platform = excluded.source_platform,
  source_url = excluded.source_url;`;
}

function serializeOptions(plan, days) {
  const rows = [];

  for (const day of days) {
    day.questions.forEach((question, questionIndex) => {
      question.options.forEach((option, optionIndex) => {
        rows.push(
          sqlTuple([
            `${day.dayNumber}`,
            `${questionIndex + 1}`,
            `${optionIndex + 1}`,
            sqlString(option.text),
            option.isCorrect ? "true" : "false"
          ])
        );
      });
    });
  }

  if (!rows.length) {
    return "";
  }

  return `
insert into public.question_options (
  task_question_id,
  position,
  option_text,
  is_correct
)
select
  tq.id,
  seed.option_position,
  seed.option_text,
  seed.is_correct
from public.task_questions tq
join public.tasks t on t.id = tq.task_id
join public.plan_days pd on pd.id = t.plan_day_id
join public.plan_templates pt on pt.id = pd.plan_template_id
join (
  values
${rows.map((row) => `    ${row}`).join(",\n")}
) as seed(day_number, question_position, option_position, option_text, is_correct)
  on seed.day_number = pd.day_number and seed.question_position = tq.position
where pt.slug = ${sqlString(plan.slug)}
on conflict (task_question_id, position) do update
set
  option_text = excluded.option_text,
  is_correct = excluded.is_correct;`;
}

function serializePlan(plan, days) {
  return `
-- ${plan.name}
insert into public.plan_templates (name, slug, duration_days, is_active)
values (${sqlString(plan.name)}, ${sqlString(plan.slug)}, ${plan.durationDays}, ${plan.isActive ? "true" : "false"})
on conflict (slug) do update
set
  name = excluded.name,
  duration_days = excluded.duration_days,
  is_active = excluded.is_active;

${serializePlanDays(plan, days)}

${serializeTasks(plan, days)}

${serializeQuestions(plan, days)}

${serializeOptions(plan, days)}
`;
}

const aptitudeBankDays = buildAptitudeBankDays();
const mixedPlanDays = buildMixedPlanDays();
const mixedAptitudeQuestionCount = mixedPlanDays
  .filter((day) => day.taskType === "aptitude")
  .reduce((sum, day) => sum + day.questions.length, 0);
const aptitudeBankQuestionCount = aptitudeBankDays.reduce(
  (sum, day) => sum + day.questions.length,
  0
);

const sql = `begin;

-- Generated by scripts/generate-rich-seed.mjs
-- Mixed plan:
--   90 days
--   ${mixedAptitudeQuestionCount} aptitude questions
--   ${dsaPracticeDays.length * 2} linked DSA problems
--   ${sqlPracticeDays.length * 2} linked SQL problems
--   ${hrPracticeDays.length * 4} HR prompts
-- Aptitude bank:
--   100 days
--   ${aptitudeBankQuestionCount} aptitude questions
--
-- This file keeps the mixed plan active and stores the 1000-question aptitude bank
-- as a separate inactive plan template for future rotation.

update public.plan_templates
set is_active = false
where is_active = true
  and slug <> ${sqlString(mixedPlan.slug)};

${serializePlan(mixedPlan, mixedPlanDays)}

${serializePlan(aptitudeBankPlan, aptitudeBankDays)}

commit;
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sql);

console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
