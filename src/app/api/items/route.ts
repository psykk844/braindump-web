import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const processed = url.searchParams.get("processed");

  let query = db.select().from(items).orderBy(desc(items.createdAt));

  const allItems = query.all().filter((item) => {
    if (type && item.type !== type) return false;
    if (processed !== null) {
      const val = processed === "true" ? 1 : 0;
      if (item.processed !== val) return false;
    }
    return true;
  });

  return NextResponse.json(allItems);
}
