import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkAuth } from "@/lib/auth";
import { completeTask, moveTask } from "@/lib/tasks";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { broadcaster } from "@/lib/sse";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const taskId = parseInt(id, 10);
  const body = await request.json();

  if (body.completed) {
    completeTask(db, taskId);
    broadcaster.emit("task-updated", { id: taskId, action: "completed" });
    return NextResponse.json({ ok: true });
  }

  if (body.bucket) {
    moveTask(db, taskId, body.bucket);
    broadcaster.emit("task-updated", { id: taskId, action: "moved", bucket: body.bucket });
  }

  if (body.note !== undefined) {
    db.update(tasks).set({ note: body.note }).where(eq(tasks.id, taskId)).run();
  }

  if (body.title !== undefined) {
    db.update(tasks).set({ title: body.title }).where(eq(tasks.id, taskId)).run();
  }

  const updated = db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  return NextResponse.json(updated);
}
