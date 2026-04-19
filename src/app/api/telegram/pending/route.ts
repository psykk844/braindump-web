import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  // Return items not yet relayed to Obsidian
  const pending = db
    .select()
    .from(items)
    .where(eq(items.relayedToObsidian, 0))
    .all();

  // Mark as relayed
  for (const item of pending) {
    db.update(items)
      .set({ relayedToObsidian: 1 })
      .where(eq(items.id, item.id))
      .run();
  }

  // Return in Telegram-compatible format for the PowerShell script
  const result = pending.map((item) => ({
    message: {
      message_id: item.telegramMessageId,
      text: item.rawText,
      date: Math.floor(new Date(item.createdAt).getTime() / 1000),
    },
  }));

  return NextResponse.json({ ok: true, result });
}
