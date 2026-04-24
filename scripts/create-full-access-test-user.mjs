import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

loadEnvFile(path.join(projectRoot, ".env.local"));

const args = parseArgs(process.argv.slice(2));
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local."
  );
}

const email =
  args.email ||
  `placement-test-${timestampLabel()}-${randomToken(4)}@example.com`;
const password = args.password || randomPassword();
const fullName = args.name || "Placement Full Access Tester";
const timezone = args.timezone || "Asia/Kolkata";
const targetRole = args["target-role"] || "Software Engineer";
const planSlug = args["plan-slug"] || "placement-sprint-rich-v1";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const { data: requestedPlan, error: requestedPlanError } = await supabase
  .from("plan_templates")
  .select("id, name, slug, duration_days")
  .eq("slug", planSlug)
  .maybeSingle();

if (requestedPlanError) {
  throw new Error(`Failed to load plan template "${planSlug}": ${requestedPlanError.message}`);
}

let selectedPlan = requestedPlan;

if (!selectedPlan) {
  const { data: activePlan, error: activePlanError } = await supabase
    .from("plan_templates")
    .select("id, name, slug, duration_days")
    .eq("is_active", true)
    .maybeSingle();

  if (activePlanError) {
    throw new Error(`Failed to load active plan template: ${activePlanError.message}`);
  }

  selectedPlan = activePlan;
}

if (!selectedPlan?.id) {
  throw new Error(
    "No plan template found. Seed the plan data first, then run this script again."
  );
}

const { data: createdUserData, error: createUserError } =
  await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      timezone
    },
    app_metadata: {
      full_access: true
    }
  });

if (createUserError || !createdUserData.user?.id) {
  throw new Error(`Failed to create test user: ${createUserError?.message || "Unknown error"}`);
}

const userId = createdUserData.user.id;
const startDate = toDateOnly(new Date(), timezone);

await throwIfError(
  supabase.from("profiles").upsert({
    user_id: userId,
    full_name: fullName,
    college_name: "Samyak Labs Test Account",
    target_role: targetRole,
    timezone,
    role: "student"
  }),
  "Failed to upsert profile"
);

await throwIfError(
  supabase.from("reminder_preferences").upsert({
    user_id: userId,
    email_enabled: true,
    weekly_reminder_enabled: true,
    weekly_reminder_day: 0,
    weekly_reminder_hour: 19,
    timezone
  }),
  "Failed to upsert reminder preferences"
);

const { data: existingPlan, error: existingPlanError } = await supabase
  .from("student_plans")
  .select("id")
  .eq("user_id", userId)
  .eq("status", "active")
  .maybeSingle();

if (existingPlanError) {
  throw new Error(`Failed to check active student plan: ${existingPlanError.message}`);
}

if (existingPlan?.id) {
  await throwIfError(
    supabase
      .from("student_plans")
      .update({
        plan_template_id: selectedPlan.id,
        start_date: startDate,
        target_minutes_per_day: 60
      })
      .eq("id", existingPlan.id),
    "Failed to update active student plan"
  );
} else {
  await throwIfError(
    supabase.from("student_plans").insert({
      user_id: userId,
      plan_template_id: selectedPlan.id,
      start_date: startDate,
      status: "active",
      target_minutes_per_day: 60
    }),
    "Failed to create active student plan"
  );
}

console.log(`Created full-access test user`);
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);
console.log(`Name: ${fullName}`);
console.log(`Timezone: ${timezone}`);
console.log(`Plan: ${selectedPlan.name} (${selectedPlan.slug})`);
console.log(`Start date: ${startDate}`);
console.log(`User ID: ${userId}`);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  return argv.reduce((acc, arg) => {
    if (!arg.startsWith("--")) {
      return acc;
    }

    const [key, ...rest] = arg.slice(2).split("=");
    acc[key] = rest.length ? rest.join("=") : "true";
    return acc;
  }, {});
}

function timestampLabel() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}`;
}

function randomToken(length) {
  return crypto.randomBytes(length).toString("hex");
}

function randomPassword() {
  return `Prep${randomToken(6)}!`;
}

function toDateOnly(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }

    return acc;
  }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

async function throwIfError(promise, label) {
  const { error } = await promise;

  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}
