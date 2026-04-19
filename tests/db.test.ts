import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { items, tasks } from "../src/db/schema";
import { eq } from "drizzle-orm";

function createTestDb() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite);
  sqlite.exec(`
    CREATE TABLE items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_message_id INTEGER NOT NULL UNIQUE,
      raw_text TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'todo',
      url TEXT,
      url_title TEXT,
      category TEXT NOT NULL DEFAULT 'uncategorized',
      processed INTEGER NOT NULL DEFAULT 0,
      relayed_to_obsidian INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER REFERENCES items(id),
      title TEXT NOT NULL,
      bucket TEXT NOT NULL DEFAULT 'later',
      "order" INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );
  `);
  return { db, sqlite };
}

describe("database schema", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;

  beforeEach(() => {
    const result = createTestDb();
    db = result.db;
    sqlite = result.sqlite;
  });

  afterEach(() => {
    sqlite.close();
  });

  it("inserts and retrieves an item", () => {
    db.insert(items).values({
      telegramMessageId: 123,
      rawText: "Test note from Telegram",
      type: "idea",
    }).run();

    const rows = db.select().from(items).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].rawText).toBe("Test note from Telegram");
    expect(rows[0].type).toBe("idea");
    expect(rows[0].processed).toBe(0);
  });

  it("inserts a task linked to an item", () => {
    db.insert(items).values({
      telegramMessageId: 456,
      rawText: "Fix the bug",
      type: "todo",
    }).run();

    const [item] = db.select().from(items).all();

    db.insert(tasks).values({
      itemId: item.id,
      title: "Fix the bug",
      bucket: "later",
      order: 1,
    }).run();

    const [task] = db.select().from(tasks).all();
    expect(task.title).toBe("Fix the bug");
    expect(task.bucket).toBe("later");
    expect(task.itemId).toBe(item.id);
  });

  it("inserts a manual task with no item_id", () => {
    db.insert(tasks).values({
      title: "Manual task",
      bucket: "top5",
      order: 1,
    }).run();

    const [task] = db.select().from(tasks).all();
    expect(task.title).toBe("Manual task");
    expect(task.itemId).toBeNull();
  });

  it("enforces unique telegram_message_id", () => {
    db.insert(items).values({
      telegramMessageId: 789,
      rawText: "First",
      type: "link",
    }).run();

    expect(() => {
      db.insert(items).values({
        telegramMessageId: 789,
        rawText: "Duplicate",
        type: "link",
      }).run();
    }).toThrow();
  });
});
