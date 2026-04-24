const REQUIRED_HEADERS = [
  "day_number",
  "task_type",
  "title",
  "topic",
  "estimated_minutes",
  "instructions",
  "solution"
] as const;

type PlanImportSummary = {
  rowCount: number;
  uniqueDays: number;
  taskTypes: string[];
};

export type PlanImportResult =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      rows: Record<string, string>[];
      summary: PlanImportSummary;
    };

export const SAMPLE_IMPORT_CSV = `day_number,task_type,title,topic,estimated_minutes,instructions,solution
1,aptitude,Percentages Warm-Up,Percentages and ratio,60,"Answer all ten questions before checking solutions.","Review the arithmetic and note where you lost time."
2,dsa,Array Patterns: Two Sum,Hashing and arrays,60,"Write brute force first, then the optimized approach.","Use a hash map to track complements and explain O(n) time."
3,sql,Second Highest Salary,SQL ranking and aggregation,50,"Write the query from memory before checking the guide.","Use a subquery or DENSE_RANK to solve the problem."
`;

function parseCsvRows(input: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentValue.trim());
      currentValue = "";

      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  return rows;
}

export function parsePlanImport(csv: string): PlanImportResult {
  const rows = parseCsvRows(csv.trim());

  if (!rows.length) {
    return {
      ok: false,
      error: "No CSV rows found."
    };
  }

  const [headers, ...body] = rows;
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length) {
    return {
      ok: false,
      error: `Missing required headers: ${missingHeaders.join(", ")}`
    };
  }

  const records = body.map((values) =>
    headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {})
  );

  const invalidRows = records
    .map((row, index) => ({
      rowNumber: index + 2,
      row
    }))
    .filter(({ row }) => {
      return (
        !row.day_number ||
        !row.task_type ||
        !row.title ||
        !row.instructions ||
        !row.solution
      );
    });

  if (invalidRows.length) {
    return {
      ok: false,
      error: `Rows with missing required values: ${invalidRows
        .map((row) => row.rowNumber)
        .join(", ")}`
    };
  }

  const uniqueDays = new Set(records.map((row) => row.day_number));
  const taskTypes = new Set(records.map((row) => row.task_type));

  return {
    ok: true,
    rows: records,
    summary: {
      rowCount: records.length,
      uniqueDays: uniqueDays.size,
      taskTypes: Array.from(taskTypes)
    }
  };
}
