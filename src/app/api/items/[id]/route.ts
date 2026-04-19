import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const itemId = parseInt(id, 10);
  const body = await request.json();

  const updates: Record<string, any> = {};
  if (body.type !== undefined) updates.type = body.type;
  if (body.processed !== undefined) updates.processed = body.processed ? 1 : 0;
  if (body.category !== undefined) updates.category = body.category;

  if (Object.keys(updates).length > 0) {
    db.update(items).set(updates).where(eq(items.id, itemId)).run();
  }

  const updated = db.select().from(items).where(eq(items.id, itemId)).get();
  return NextResponse.json(updated);
}
