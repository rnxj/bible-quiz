import { sql } from "drizzle-orm";
import { index, int, primaryKey, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const createTable = sqliteTableCreator((name) => `bible-quiz_${name}`);

export const posts = createTable(
  "post",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name", { length: 256 }),
    createdAt: int("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

// Quiz attempts schema
export const quizAttempts = createTable(
  "quiz_attempt",
  {
    id: text("id").primaryKey(), // Using the same format as in localStorage: `${bookId}_${chapterNumber}_${timestamp}`
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    bookId: text("book_id").notNull(),
    book: text("book").notNull(),
    chapterNumber: int("chapter_number").notNull(),
    totalQuestions: int("total_questions").notNull(),
    correctAnswers: int("correct_answers").notNull(),
    results: text("results", { mode: "json" }).notNull(),
    timestamp: int("timestamp", { mode: "timestamp" }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
  },
  (table) => ({
    bookChapterIndex: index("book_chapter_idx").on(table.bookId, table.chapterNumber),
    userIndex: index("user_idx").on(table.userId),
  }),
);

// Sync status table to track which local storage data has been synced to the database
export const syncStatus = createTable(
  "sync_status",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lastSyncedAt: int("last_synced_at", { mode: "timestamp" }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdPk: primaryKey({ columns: [table.userId] }),
  }),
);

export * from "./auth-schema";
