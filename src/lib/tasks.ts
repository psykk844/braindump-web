import { eq, asc, desc } from "drizzle-orm";
import { tasks } from "@/db/schema";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type DB = BetterSQLite3Database<any>;
type TaskRow = typeof tasks.$inferSelect;

export function getTasksByBucket(db: DB, bucket: string): TaskRow[] {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.bucket, bucket))
    .orderBy(asc(tasks.order))
    .all();
}

export function getAllTasks(db: DB): TaskRow[] {
  return db.select().from(tasks).orderBy(asc(tasks.order)).all();
}

export function addTask(
  db: DB,
  title: string,
  bucket: string,
  itemId?: number | null
): TaskRow {
  const existing = getTasksByBucket(db, bucket);
  const order = existing.length + 1;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  const result = db
    .insert(tasks)
    .values({
      title,
      bucket,
      order,
      itemId: itemId ?? null,
      createdAt: now,
    })
    .returning()
    .get();

  return result;
}

export function completeTask(db: DB, taskId: number): void {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const task = db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task) return;

  const wasBucket = task.bucket;

  // Mark done
  db.update(tasks)
    .set({ bucket: "done", completedAt: now })
    .where(eq(tasks.id, taskId))
    .run();

  // Normalize old bucket
  normalizeOrders(db, wasBucket);

  // Auto-promote from next if was top5
  if (wasBucket === "top5") {
    const top5Count = getTasksByBucket(db, "top5").length;
    if (top5Count < 5) {
      const nextTasks = getTasksByBucket(db, "next");
      if (nextTasks.length > 0) {
        const promote = nextTasks[0];
        db.update(tasks)
          .set({ bucket: "top5", order: top5Count + 1 })
          .where(eq(tasks.id, promote.id))
          .run();
        normalizeOrders(db, "next");
        normalizeOrders(db, "top5");
      }
    }
  }
}

export function moveTask(db: DB, taskId: number, targetBucket: string): void {
  const task = db.select().from(tasks).where(eq(tasks.id, taskId)).get();
  if (!task || task.bucket === targetBucket) return;

  const oldBucket = task.bucket;
  const targetTasks = getTasksByBucket(db, targetBucket);

  db.update(tasks)
    .set({
      bucket: targetBucket,
      order: targetTasks.length + 1,
      completedAt: targetBucket === "done"
        ? new Date().toISOString().replace("T", " ").slice(0, 19)
        : null,
    })
    .where(eq(tasks.id, taskId))
    .run();

  normalizeOrders(db, oldBucket);
  enforceTop5(db);
  normalizeOrders(db, targetBucket);
}

export function enforceTop5(db: DB): void {
  const top5 = getTasksByBucket(db, "top5");
  if (top5.length <= 5) return;

  const overflow = top5.slice(5);
  const nextTasks = getTasksByBucket(db, "next");
  let nextOrder = nextTasks.length;

  for (const task of overflow) {
    nextOrder++;
    db.update(tasks)
      .set({ bucket: "next", order: nextOrder })
      .where(eq(tasks.id, task.id))
      .run();
  }

  normalizeOrders(db, "top5");
  normalizeOrders(db, "next");
}

export function reorderBucket(db: DB, bucket: string, taskIds: number[]): void {
  for (let i = 0; i < taskIds.length; i++) {
    db.update(tasks)
      .set({ order: i + 1 })
      .where(eq(tasks.id, taskIds[i]))
      .run();
  }
}

function normalizeOrders(db: DB, bucket: string): void {
  const bucketTasks = getTasksByBucket(db, bucket);
  for (let i = 0; i < bucketTasks.length; i++) {
    if (bucketTasks[i].order !== i + 1) {
      db.update(tasks)
        .set({ order: i + 1 })
        .where(eq(tasks.id, bucketTasks[i].id))
        .run();
    }
  }
}
