import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkAuth } from "@/lib/auth";
import { reorderBucket } from "@/lib/tasks";
import { broadcaster } from "@/lib/sse";

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const { bucket, taskIds } = body;

  if (!bucket || !Array.isArray(taskIds)) {
    return NextResponse.json({ error: "bucket and taskIds required" }, { status: 400 });
  }

  reorderBucket(db, bucket, taskIds);
  broadcaster.emit("tasks-reordered", { bucket });
  return NextResponse.json({ ok: true });
}
