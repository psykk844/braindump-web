import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { items, tasks } from "../../src/db/schema";
import { classifyMessage } from "../../src/lib/classify";
import { addTask } from "../../src/lib/tasks";

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

describe("webhook processing logic", () => {
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

  it("processes a todo message into items and tasks", () => {
    const text = "Fix the login bug on staging";
    const classification = classifyMessage(text);

    const [item] = db.insert(items).values({
      telegramMessageId: 100,
      rawText: text,
      type: classification.type,
      url: classification.url,
      category: classification.category,
    }).returning().all();

    expect(item.type).toBe("todo");

    if (classification.type === "todo") {
      addTask(db, text, "later", item.id);
    }

    const allTasks = db.select().from(tasks).all();
    expect(allTasks).toHaveLength(1);
    expect(allTasks[0].itemId).toBe(item.id);
    expect(allTasks[0].bucket).toBe("later");
  });

  it("processes a link message into items only", () => {
    const text = "https://github.com/unohee/OpenSwarm";
    const classification = classifyMessage(text);

    db.insert(items).values({
      telegramMessageId: 101,
      rawText: text,
      type: classification.type,
      url: classification.url,
      category: classification.category,
    }).run();

    const allItems = db.select().from(items).all();
    expect(allItems).toHaveLength(1);
    expect(allItems[0].type).toBe("link");
    expect(allItems[0].url).toBe("https://github.com/unohee/OpenSwarm");

    // Links don't auto-create tasks
    const allTasks = db.select().from(tasks).all();
    expect(allTasks).toHaveLength(0);
  });

  it("deduplicates by telegram_message_id", () => {
    db.insert(items).values({
      telegramMessageId: 102,
      rawText: "First capture",
      type: "idea",
    }).run();

    expect(() => {
      db.insert(items).values({
        telegramMessageId: 102,
        rawText: "Duplicate",
        type: "idea",
      }).run();
    }).toThrow();
  });

  it("marks items as not relayed initially", () => {
    db.insert(items).values({
      telegramMessageId: 103,
      rawText: "New note",
      type: "idea",
    }).run();

    const [item] = db.select().from(items).all();
    expect(item.relayedToObsidian).toBe(0);
  });
});
