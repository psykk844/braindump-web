import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { tasks } from "../src/db/schema";
import { eq } from "drizzle-orm";
import {
  getTasksByBucket,
  completeTask,
  moveTask,
  reorderBucket,
  enforceTop5,
  addTask,
} from "../src/lib/tasks";

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

function seedTasks(db: ReturnType<typeof drizzle>) {
  // 5 top5 tasks
  for (let i = 1; i <= 5; i++) {
    db.insert(tasks).values({ title: `Top ${i}`, bucket: "top5", order: i }).run();
  }
  // 3 next tasks
  for (let i = 1; i <= 3; i++) {
    db.insert(tasks).values({ title: `Next ${i}`, bucket: "next", order: i }).run();
  }
  // 2 later tasks
  for (let i = 1; i <= 2; i++) {
    db.insert(tasks).values({ title: `Later ${i}`, bucket: "later", order: i }).run();
  }
}

describe("task business logic", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;

  beforeEach(() => {
    const result = createTestDb();
    db = result.db;
    sqlite = result.sqlite;
    seedTasks(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  it("getTasksByBucket returns sorted tasks", () => {
    const top5 = getTasksByBucket(db, "top5");
    expect(top5).toHaveLength(5);
    expect(top5[0].title).toBe("Top 1");
    expect(top5[4].title).toBe("Top 5");
  });

  it("addTask to later bucket", () => {
    const task = addTask(db, "New task", "later");
    expect(task.bucket).toBe("later");
    expect(task.order).toBe(3);
  });

  it("completeTask moves to done and auto-promotes next", () => {
    const top5Before = getTasksByBucket(db, "top5");
    completeTask(db, top5Before[0].id);

    const top5After = getTasksByBucket(db, "top5");
    expect(top5After).toHaveLength(5);
    // Next 1 should have been promoted
    expect(top5After.some((t) => t.title === "Next 1")).toBe(true);

    const nextAfter = getTasksByBucket(db, "next");
    expect(nextAfter).toHaveLength(2);
  });

  it("completeTask when next is empty does not promote", () => {
    // Clear next bucket
    db.delete(tasks).where(eq(tasks.bucket, "next")).run();

    const top5Before = getTasksByBucket(db, "top5");
    completeTask(db, top5Before[0].id);

    const top5After = getTasksByBucket(db, "top5");
    expect(top5After).toHaveLength(4);
  });

  it("moveTask between buckets", () => {
    const later = getTasksByBucket(db, "later");
    moveTask(db, later[0].id, "next");

    const nextAfter = getTasksByBucket(db, "next");
    expect(nextAfter).toHaveLength(4);
    expect(nextAfter.some((t) => t.title === "Later 1")).toBe(true);
  });

  it("enforceTop5 pushes overflow to next", () => {
    // Add a 6th task directly to top5
    db.insert(tasks).values({ title: "Top 6", bucket: "top5", order: 6 }).run();

    enforceTop5(db);

    const top5 = getTasksByBucket(db, "top5");
    expect(top5).toHaveLength(5);

    const next = getTasksByBucket(db, "next");
    expect(next.some((t) => t.title === "Top 6")).toBe(true);
  });

  it("reorderBucket updates order values", () => {
    const top5 = getTasksByBucket(db, "top5");
    const reversed = [...top5].reverse().map((t) => t.id);
    reorderBucket(db, "top5", reversed);

    const reordered = getTasksByBucket(db, "top5");
    expect(reordered[0].title).toBe("Top 5");
    expect(reordered[4].title).toBe("Top 1");
  });
});
