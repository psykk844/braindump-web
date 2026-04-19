import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { classifyMessage } from "@/lib/classify";
import { addTask } from "@/lib/tasks";
import { broadcaster } from "@/lib/sse";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true }); // Ignore non-text messages
    }

    // Only accept messages from our chat
    const expectedChatId = process.env.TELEGRAM_CHAT_ID;
    if (expectedChatId && String(message.chat.id) !== expectedChatId) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text as string;
    const messageId = message.message_id as number;
    const classification = classifyMessage(text);

    // Insert item (dedupe by telegram_message_id)
    let item;
    try {
      [item] = db
        .insert(items)
        .values({
          telegramMessageId: messageId,
          rawText: text,
          type: classification.type,
          url: classification.url,
          category: classification.category,
        })
        .returning()
        .all();
    } catch (e: any) {
      if (e.message?.includes("UNIQUE constraint")) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      throw e;
    }

    // Auto-create task for todos
    if (classification.type === "todo") {
      addTask(db, text, "later", item.id);
    }

    // Broadcast to connected clients
    broadcaster.emit("new-item", {
      id: item.id,
      type: classification.type,
      text: text,
    });

    return NextResponse.json({ ok: true, item_id: item.id });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
