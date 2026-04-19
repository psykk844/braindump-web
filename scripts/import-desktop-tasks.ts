/**
 * One-time import from desktop task_board_data.json into the web app.
 * Run: npx tsx scripts/import-desktop-tasks.ts ../task_board_data.json
 *
 * This is copy-only — the source file is never modified.
 */
import fs from "node:fs";

const inputPath = process.argv[2] || "../task_board_data.json";
const apiUrl = process.argv[3] || "http://localhost:3000/api/tasks/import";

const token = process.env.BRAINDUMP_API_TOKEN || "";

const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
const tasks = raw.tasks || [];

console.log(`Found ${tasks.length} tasks in ${inputPath}`);
console.log(`Importing to ${apiUrl}...`);

fetch(apiUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  body: JSON.stringify({ tasks }),
})
  .then(async (r) => {
    const body = await r.json();
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}: ${JSON.stringify(body)}`);
    }
    return body;
  })
  .then((data) => {
    console.log(`Done! Imported ${data.imported} tasks.`);
  })
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  });
