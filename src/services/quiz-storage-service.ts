import { db } from "@/server/db";
import { quizAttempts, syncStatus } from "@/server/db/schema";
import { useQuizHistory } from "@/store/quiz-history";
import type { QuizResult } from "@/types/quiz";
import { and, eq } from "drizzle-orm";

// Import the QuizAttempt type from the quiz-history store
import type { QuizAttempt } from "@/store/quiz-history";

/**
 * Service to handle quiz data storage and retrieval
 * Decides between localStorage and database based on authentication status
 */
export class QuizStorageService {
  private userId: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  /**
   * Set the user ID when a user logs in
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Clear the user ID when a user logs out
   */
  clearUserId() {
    this.userId = null;
  }

  /**
   * Add a new quiz attempt
   * Stores in database if user is logged in, otherwise in localStorage
   */
  async addAttempt(attemptData: Omit<QuizAttempt, "id" | "timestamp">): Promise<QuizAttempt> {
    if (this.userId) {
      // User is logged in, store in database
      return this.addAttemptToDatabase(attemptData);
    }

    // User is not logged in, store in localStorage
    // Note: The implementation in quiz-history.ts returns the new attempt, but the type says void
    // We'll create a fallback attempt just in case
    useQuizHistory.getState().addAttempt(attemptData);

    // Create a new attempt object to return
    return {
      id: `${attemptData.bookId}_${attemptData.chapterNumber}_${Date.now()}`,
      ...attemptData,
      timestamp: Date.now(),
    };
  }

  /**
   * Get all attempts for a specific book chapter
   */
  async getAttempts(bookId: string, chapterNumber: number): Promise<QuizAttempt[]> {
    if (this.userId) {
      // User is logged in, get from database
      return this.getAttemptsFromDatabase(bookId, chapterNumber);
    }

    // User is not logged in, get from localStorage
    return useQuizHistory.getState().getAttempts(bookId, chapterNumber);
  }

  /**
   * Get the most recent attempt for a specific book chapter
   */
  async getLatestAttempt(bookId: string, chapterNumber: number): Promise<QuizAttempt | null> {
    if (this.userId) {
      // User is logged in, get from database
      const attempts = await this.getAttemptsFromDatabase(bookId, chapterNumber);
      if (attempts.length === 0) return null;

      // Sort by timestamp (newest first) and return the first one
      return [...attempts].sort((a, b) => b.timestamp - a.timestamp)[0];
    }

    // User is not logged in, get from localStorage
    return useQuizHistory.getState().getLatestAttempt(bookId, chapterNumber);
  }

  /**
   * Clear history - either all history, or for a specific book/chapter
   */
  async clearHistory(bookId?: string, chapterNumber?: number): Promise<void> {
    if (this.userId) {
      // User is logged in, clear from database
      await this.clearHistoryFromDatabase(bookId, chapterNumber);
    }

    // Always clear from localStorage as well
    useQuizHistory.getState().clearHistory(bookId, chapterNumber);
  }

  /**
   * Sync localStorage data to database when user logs in
   * Returns true if sync was successful
   */
  async syncLocalStorageToDatabase(): Promise<boolean> {
    if (!this.userId) return false;

    try {
      // Get all attempts from localStorage
      const localStorageAttempts = useQuizHistory.getState().attempts;

      // For each attempt in localStorage, add it to the database
      for (const key in localStorageAttempts) {
        const attempts = localStorageAttempts[key];
        for (const attempt of attempts) {
          // Check if this attempt already exists in the database
          const existingAttempt = await db.query.quizAttempts.findFirst({
            where: eq(quizAttempts.id, attempt.id),
          });

          if (existingAttempt) continue; // Skip if already exists

          // Create a results object with questionId as key and userAnswer as value
          const resultsObject: Record<number, number | null> = {};
          for (const result of attempt.results) {
            resultsObject[result.questionId] = result.userAnswer;
          }

          // Create the attempt in the database with the results as JSON
          await db.insert(quizAttempts).values({
            id: attempt.id,
            userId: this.userId,
            bookId: attempt.bookId,
            book: attempt.book,
            chapterNumber: attempt.chapterNumber,
            totalQuestions: attempt.totalQuestions,
            correctAnswers: attempt.correctAnswers,
            results: resultsObject,
            timestamp: new Date(attempt.timestamp),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Update sync status
      const existingSyncStatus = await db.query.syncStatus.findFirst({
        where: eq(syncStatus.userId, this.userId),
      });

      if (existingSyncStatus) {
        await db
          .update(syncStatus)
          .set({
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(syncStatus.userId, this.userId));
      } else {
        await db.insert(syncStatus).values({
          userId: this.userId,
          lastSyncedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Clear localStorage after successful sync
      useQuizHistory.getState().clearHistory();

      return true;
    } catch (error) {
      console.error("Error syncing localStorage to database:", error);
      return false;
    }
  }

  // Private methods for database operations

  private async addAttemptToDatabase(
    attemptData: Omit<QuizAttempt, "id" | "timestamp">,
    existingId?: string,
    existingTimestamp?: number,
  ): Promise<QuizAttempt> {
    const timestamp = existingTimestamp || Date.now();
    const id = existingId || `${attemptData.bookId}_${attemptData.chapterNumber}_${timestamp}`;

    if (!this.userId) {
      throw new Error("Cannot add attempt to database: User ID is not set");
    }

    // Create a results object with questionId as key and userAnswer as value
    const resultsObject: Record<number, number | null> = {};
    for (const result of attemptData.results) {
      resultsObject[result.questionId] = result.userAnswer;
    }

    // Create the attempt in the database with the results as JSON
    await db.insert(quizAttempts).values({
      id,
      userId: this.userId,
      bookId: attemptData.bookId,
      book: attemptData.book,
      chapterNumber: attemptData.chapterNumber,
      totalQuestions: attemptData.totalQuestions,
      correctAnswers: attemptData.correctAnswers,
      results: resultsObject,
      timestamp: new Date(timestamp),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return the full attempt object
    return {
      id,
      bookId: attemptData.bookId,
      book: attemptData.book,
      chapterNumber: attemptData.chapterNumber,
      totalQuestions: attemptData.totalQuestions,
      correctAnswers: attemptData.correctAnswers,
      results: attemptData.results,
      timestamp,
    };
  }

  private async getAttemptsFromDatabase(
    bookId: string,
    chapterNumber: number,
  ): Promise<QuizAttempt[]> {
    if (!this.userId) {
      return [];
    }

    // Get all attempts for this book chapter
    const attemptRows = await db.query.quizAttempts.findMany({
      where: and(
        eq(quizAttempts.userId, this.userId),
        eq(quizAttempts.bookId, bookId),
        eq(quizAttempts.chapterNumber, chapterNumber),
      ),
    });

    // Map database rows to QuizAttempt objects
    return attemptRows.map((row) => {
      // Convert the JSON results object to QuizResult array
      const resultsObject = row.results as Record<number, number | null>;
      const results: QuizResult[] = Object.entries(resultsObject).map(
        ([questionId, userAnswer]) => ({
          questionId: Number(questionId),
          userAnswer: userAnswer,
        }),
      );

      return {
        id: row.id,
        bookId: row.bookId,
        book: row.book,
        chapterNumber: row.chapterNumber,
        totalQuestions: row.totalQuestions,
        correctAnswers: row.correctAnswers,
        results,
        timestamp: row.timestamp instanceof Date ? row.timestamp.getTime() : Number(row.timestamp),
      };
    });
  }

  private async clearHistoryFromDatabase(bookId?: string, chapterNumber?: number): Promise<void> {
    if (!this.userId) {
      return;
    }

    // Build the where clause based on the input
    let whereClause = and(eq(quizAttempts.userId, this.userId));

    if (bookId) {
      whereClause = and(whereClause, eq(quizAttempts.bookId, bookId));
    }

    if (chapterNumber !== undefined) {
      whereClause = and(whereClause, eq(quizAttempts.chapterNumber, chapterNumber));
    }

    // Delete all matching attempts
    await db.delete(quizAttempts).where(whereClause);
  }
}
