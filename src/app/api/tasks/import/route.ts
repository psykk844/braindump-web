import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkAuth } from "@/lib/auth";
import { tasks } from "@/db/schema";

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const importedTasks = body.tasks;

  if (!Array.isArray(importedTasks)) {
    return NextResponse.json({ error: "tasks array required" }, { status: 400 });
  }

  let imported = 0;
  for (const t of importedTasks) {
    if (!t.title?.trim()) continue;
    // Skip "done" tasks older than 14 days
    if (t.bucket === "done") continue;

    db.insert(tasks)
      .values({
        title: t.title.trim(),
        bucket: t.bucket || "later",
        order: t.order || 0,
        note: t.note || "",
        createdAt: t.created_at || new Date().toISOString().replace("T", " ").slice(0, 19),
        completedAt: t.completed_at || null,
      })
      .run();
    imported++;
  }

  return NextResponse.json({ ok: true, imported });
}
