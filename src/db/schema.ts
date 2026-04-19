import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  telegramMessageId: integer("telegram_message_id").notNull().unique(),
  rawText: text("raw_text").notNull(),
  type: text("type").notNull().default("todo"), // link | idea | todo
  url: text("url"),
  urlTitle: text("url_title"),
  category: text("category").notNull().default("uncategorized"),
  processed: integer("processed").notNull().default(0), // 0 or 1
  relayedToObsidian: integer("relayed_to_obsidian").notNull().default(0), // 0 or 1
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").references(() => items.id),
  title: text("title").notNull(),
  bucket: text("bucket").notNull().default("later"), // top5 | next | later | done
  order: integer("order").notNull().default(0),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  completedAt: text("completed_at"),
});
