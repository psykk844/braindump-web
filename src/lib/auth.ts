import { NextRequest, NextResponse } from "next/server";

export function checkAuth(request: NextRequest): NextResponse | null {
  const token = process.env.BRAINDUMP_API_TOKEN;
  if (!token) return null; // No token configured = no auth required

  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // Auth passed
}

export function checkTelegramSecret(request: NextRequest): boolean {
  // Telegram sends a secret_token header if configured via setWebhook
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  const expected = process.env.TELEGRAM_BOT_TOKEN;
  if (!expected) return true; // No validation if not configured
  return secret === expected;
}
