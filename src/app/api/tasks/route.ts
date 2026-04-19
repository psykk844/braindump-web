import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkAuth } from "@/lib/auth";
import { getAllTasks, addTask } from "@/lib/tasks";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const allTasks = getAllTasks(db);
  return NextResponse.json(allTasks);
}

export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const { title, bucket = "later" } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const task = addTask(db, title.trim(), bucket);
  return NextResponse.json(task, { status: 201 });
}
