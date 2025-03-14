import { loadQuizData } from "@/lib/quiz-loader";
import type { createTRPCContext } from "@/server/api/trpc";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { quizAttempts, syncStatus, user } from "@/server/db/schema";
import type { QuizData } from "@/types/quiz";
import type { inferAsyncReturnType } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

// Define the QuizResult schema
const quizResultSchema = z.object({
  questionId: z.number(),
  userAnswer: z.number().nullable(),
});

// Define the QuizAttempt schema
const quizAttemptSchema = z.object({
  bookId: z.string(),
  book: z.string(),
  chapterNumber: z.number(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  results: z.array(quizResultSchema),
});

// Type for the context with non-null session
type ProtectedContext = inferAsyncReturnType<typeof createTRPCContext> & {
  session: {
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
      image?: string | null | undefined;
    };
  };
};

// Helper function to calculate streak
async function calculateStreak(ctx: ProtectedContext): Promise<number> {
  // Get all attempts ordered by timestamp
  const attempts = await ctx.db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, ctx.session.user.id),
    orderBy: (attempts, { desc }) => [desc(attempts.timestamp)],
  });

  if (attempts.length === 0) return 0;

  // Convert timestamps to dates (just the date part, not time)
  const attemptDates = attempts.map((attempt) => {
    const date =
      attempt.timestamp instanceof Date ? attempt.timestamp : new Date(Number(attempt.timestamp));
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });

  // Remove duplicate dates (only count one quiz per day)
  const uniqueDates = Array.from(new Set(attemptDates.map((date) => date.getTime())))
    .map((time) => new Date(time))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort in descending order

  if (uniqueDates.length === 0) return 0;

  // Check if the most recent attempt was today or yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentDate = uniqueDates[0];

  // If the most recent attempt is not from today or yesterday, streak is broken
  if (
    mostRecentDate.getTime() !== today.getTime() &&
    mostRecentDate.getTime() !== yesterday.getTime()
  ) {
    return 0;
  }

  // Count consecutive days
  let streak = 1; // Start with 1 for the most recent day
  let currentDate = mostRecentDate;

  for (let i = 1; i < uniqueDates.length; i++) {
    const expectedPreviousDate = new Date(currentDate);
    expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);

    if (uniqueDates[i].getTime() === expectedPreviousDate.getTime()) {
      streak++;
      currentDate = uniqueDates[i];
    } else {
      break; // Streak is broken
    }
  }

  return streak;
}

export const quizRouter = createTRPCRouter({
  // Get all attempts for a specific book chapter
  getAttempts: protectedProcedure
    .input(z.object({ bookId: z.string(), chapterNumber: z.number() }))
    .query(
      async ({
        ctx,
        input,
      }: {
        ctx: ProtectedContext;
        input: { bookId: string; chapterNumber: number };
      }) => {
        const attemptRows = await ctx.db.query.quizAttempts.findMany({
          where: and(
            eq(quizAttempts.userId, ctx.session.user.id),
            eq(quizAttempts.bookId, input.bookId),
            eq(quizAttempts.chapterNumber, input.chapterNumber),
          ),
        });

        // Get the quiz data for this book and chapter
        let quizData: QuizData | null = null;
        try {
          quizData = await loadQuizData(input.bookId, input.chapterNumber, "en");
        } catch (error) {
          console.error("Error fetching quiz data:", error);
        }

        // Map database rows to QuizAttempt objects
        return await Promise.all(
          attemptRows.map(async (row) => {
            // Convert the JSON results object to QuizResult array
            const resultsObject = row.results as Record<number, number | null>;
            const results = Object.entries(resultsObject).map(([questionId, userAnswer]) => ({
              questionId: Number(questionId),
              userAnswer: userAnswer,
            }));

            // Update correctAnswers if it's 0 and we have quiz data
            if (row.correctAnswers === 0 && quizData?.questions) {
              let correctAnswersCount = 0;

              for (const [questionIdStr, userAnswer] of Object.entries(resultsObject)) {
                const questionId = Number(questionIdStr);
                const question = quizData.questions.find((q) => q.id === questionId);

                if (question && userAnswer === question.correctAnswer) {
                  correctAnswersCount++;
                }
              }

              // Update the attempt with the correct answers count
              if (correctAnswersCount > 0) {
                await ctx.db
                  .update(quizAttempts)
                  .set({ correctAnswers: correctAnswersCount })
                  .where(eq(quizAttempts.id, row.id));

                row.correctAnswers = correctAnswersCount;
              }
            }

            return {
              id: row.id,
              bookId: row.bookId,
              book: row.book,
              chapterNumber: row.chapterNumber,
              totalQuestions: row.totalQuestions,
              correctAnswers: row.correctAnswers,
              results,
              timestamp:
                row.timestamp instanceof Date ? row.timestamp.getTime() : Number(row.timestamp),
            };
          }),
        );
      },
    ),

  // Get the latest attempt for a specific book chapter
  getLatestAttempt: protectedProcedure
    .input(z.object({ bookId: z.string(), chapterNumber: z.number() }))
    .query(
      async ({
        ctx,
        input,
      }: {
        ctx: ProtectedContext;
        input: { bookId: string; chapterNumber: number };
      }) => {
        const attempts = await ctx.db.query.quizAttempts.findMany({
          where: and(
            eq(quizAttempts.userId, ctx.session.user.id),
            eq(quizAttempts.bookId, input.bookId),
            eq(quizAttempts.chapterNumber, input.chapterNumber),
          ),
          orderBy: (attempts, { desc }) => [desc(attempts.timestamp)],
          limit: 1,
        });

        if (attempts.length === 0) return null;

        const row = attempts[0];

        // Get the quiz data for this attempt using loadQuizData
        const quizData = await loadQuizData(input.bookId, input.chapterNumber, "en");

        // Update correctAnswers if it's 0
        if (row.correctAnswers === 0) {
          try {
            if (quizData?.questions) {
              // Calculate correct answers
              const resultsObject = row.results as Record<number, number | null>;
              let correctAnswersCount = 0;

              for (const [questionIdStr, userAnswer] of Object.entries(resultsObject)) {
                const questionId = Number(questionIdStr);
                const question = quizData.questions.find((q) => q.id === questionId);

                if (question && userAnswer === question.correctAnswer) {
                  correctAnswersCount++;
                }
              }

              // Update the attempt with the correct answers count
              if (correctAnswersCount > 0) {
                await ctx.db
                  .update(quizAttempts)
                  .set({ correctAnswers: correctAnswersCount })
                  .where(eq(quizAttempts.id, row.id));

                row.correctAnswers = correctAnswersCount;
              }
            }
          } catch (error) {
            console.error("Error updating correct answers:", error);
          }
        }

        // Convert the JSON results object to QuizResult array
        const resultsObject = row.results as Record<number, number | null>;
        const results = Object.entries(resultsObject).map(([questionId, userAnswer]) => ({
          questionId: Number(questionId),
          userAnswer: userAnswer,
        }));

        return {
          id: row.id,
          bookId: row.bookId,
          book: row.book,
          chapterNumber: row.chapterNumber,
          totalQuestions: row.totalQuestions,
          correctAnswers: row.correctAnswers,
          results,
          timestamp:
            row.timestamp instanceof Date ? row.timestamp.getTime() : Number(row.timestamp),
        };
      },
    ),

  // Get dashboard statistics
  getDashboardStats: protectedProcedure.query(async ({ ctx }: { ctx: ProtectedContext }) => {
    // Get total number of quizzes taken
    const totalQuizzesResult = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, ctx.session.user.id));

    const totalQuizzes = totalQuizzesResult[0]?.count || 0;

    // Get the latest quiz attempt
    const latestQuiz = await ctx.db.query.quizAttempts.findFirst({
      where: eq(quizAttempts.userId, ctx.session.user.id),
      orderBy: (attempts, { desc }) => [desc(attempts.timestamp)],
    });

    // Calculate total correct answers and accuracy
    const totalCorrectAnswersResult = await ctx.db
      .select({ sum: sql<number>`sum(${quizAttempts.correctAnswers})` })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, ctx.session.user.id));

    const totalQuestionsResult = await ctx.db
      .select({ sum: sql<number>`sum(${quizAttempts.totalQuestions})` })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, ctx.session.user.id));

    const totalCorrectAnswers = totalCorrectAnswersResult[0]?.sum || 0;
    const totalQuestions = totalQuestionsResult[0]?.sum || 0;

    // Calculate accuracy
    const accuracy = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0;

    // Get recent quiz attempts (last 5)
    const recentAttempts = await ctx.db.query.quizAttempts.findMany({
      where: eq(quizAttempts.userId, ctx.session.user.id),
      orderBy: (attempts, { desc }) => [desc(attempts.timestamp)],
      limit: 5,
    });

    // Map recent attempts to a simpler format
    const recentActivity = recentAttempts.map((attempt) => ({
      id: attempt.id,
      book: attempt.book,
      chapterNumber: attempt.chapterNumber,
      timestamp:
        attempt.timestamp instanceof Date ? attempt.timestamp.getTime() : Number(attempt.timestamp),
    }));

    // Calculate current streak
    const streak = await calculateStreak(ctx);

    return {
      totalQuizzes,
      totalCorrectAnswers,
      totalQuestions,
      accuracy: Math.round(accuracy),
      streak,
      latestQuiz: latestQuiz
        ? {
            book: latestQuiz.book,
            chapterNumber: latestQuiz.chapterNumber,
            timestamp:
              latestQuiz.timestamp instanceof Date
                ? latestQuiz.timestamp.getTime()
                : Number(latestQuiz.timestamp),
          }
        : null,
      recentActivity,
    };
  }),

  // Get user's current streak
  getStreak: protectedProcedure.query(async ({ ctx }: { ctx: ProtectedContext }) => {
    return calculateStreak(ctx);
  }),

  // Get user's quiz statistics by book
  getBookStats: protectedProcedure.query(async ({ ctx }: { ctx: ProtectedContext }) => {
    // Get all attempts grouped by book
    const bookStatsQuery = await ctx.db
      .select({
        bookId: quizAttempts.bookId,
        bookName: quizAttempts.book,
        totalAttempts: sql<number>`count(*)`,
        totalQuestions: sql<number>`sum(${quizAttempts.totalQuestions})`,
        correctAnswers: sql<number>`sum(${quizAttempts.correctAnswers})`,
      })
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, ctx.session.user.id))
      .groupBy(quizAttempts.bookId, quizAttempts.book);

    return bookStatsQuery.map((stats) => ({
      bookId: stats.bookId,
      bookName: stats.bookName,
      totalAttempts: stats.totalAttempts,
      totalQuestions: stats.totalQuestions,
      correctAnswers: stats.correctAnswers,
      accuracy:
        stats.totalQuestions > 0
          ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
          : 0,
    }));
  }),

  // Add a new quiz attempt
  addAttempt: protectedProcedure.input(quizAttemptSchema).mutation(
    async ({
      ctx,
      input,
    }: {
      ctx: ProtectedContext;
      input: z.infer<typeof quizAttemptSchema>;
    }) => {
      const timestamp = Date.now();
      const id = `${input.bookId}_${input.chapterNumber}_${timestamp}`;

      // Create a results object with questionId as key and userAnswer as value
      const resultsObject: Record<number, number | null> = {};
      for (const result of input.results) {
        resultsObject[result.questionId] = result.userAnswer;
      }

      // Create the attempt in the database with the results as JSON
      await ctx.db.insert(quizAttempts).values({
        id,
        userId: ctx.session.user.id,
        bookId: input.bookId,
        book: input.book,
        chapterNumber: input.chapterNumber,
        totalQuestions: input.totalQuestions,
        correctAnswers: input.correctAnswers,
        results: resultsObject,
        timestamp: new Date(timestamp),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Return the full attempt object
      return {
        id,
        bookId: input.bookId,
        book: input.book,
        chapterNumber: input.chapterNumber,
        totalQuestions: input.totalQuestions,
        correctAnswers: input.correctAnswers,
        results: input.results,
        timestamp,
      };
    },
  ),

  // Sync localStorage data to database
  syncLocalStorage: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          bookId: z.string(),
          book: z.string(),
          chapterNumber: z.number(),
          totalQuestions: z.number(),
          correctAnswers: z.number(),
          results: z.array(quizResultSchema),
          timestamp: z.number(),
        }),
      ),
    )
    .mutation(
      async ({
        ctx,
        input,
      }: {
        ctx: ProtectedContext;
        input: Array<{
          id: string;
          bookId: string;
          book: string;
          chapterNumber: number;
          totalQuestions: number;
          correctAnswers: number;
          results: Array<{
            questionId: number;
            userAnswer: number | null;
          }>;
          timestamp: number;
        }>;
      }) => {
        // For each attempt in localStorage, add it to the database
        for (const attempt of input) {
          // Check if this attempt already exists in the database
          const existingAttempt = await ctx.db.query.quizAttempts.findFirst({
            where: eq(quizAttempts.id, attempt.id),
          });

          if (existingAttempt) continue; // Skip if already exists

          // Create a results object with questionId as key and userAnswer as value
          const resultsObject: Record<number, number | null> = {};
          for (const result of attempt.results) {
            resultsObject[result.questionId] = result.userAnswer;
          }

          // Create the attempt in the database with the results as JSON
          await ctx.db.insert(quizAttempts).values({
            id: attempt.id,
            userId: ctx.session.user.id,
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

        // Update the sync status
        const existingSyncStatus = await ctx.db.query.syncStatus.findFirst({
          where: eq(syncStatus.userId, ctx.session.user.id),
        });

        if (existingSyncStatus) {
          await ctx.db
            .update(syncStatus)
            .set({
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(syncStatus.userId, ctx.session.user.id));
        } else {
          await ctx.db.insert(syncStatus).values({
            userId: ctx.session.user.id,
            lastSyncedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return { success: true };
      },
    ),

  // Clear history - either all history, or for a specific book/chapter
  clearHistory: protectedProcedure
    .input(
      z.object({
        bookId: z.string().optional(),
        chapterNumber: z.number().optional(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input,
      }: {
        ctx: ProtectedContext;
        input: {
          bookId?: string;
          chapterNumber?: number;
        };
      }) => {
        // Build the where clause based on the input
        let whereClause = and(eq(quizAttempts.userId, ctx.session.user.id));

        if (input.bookId) {
          whereClause = and(whereClause, eq(quizAttempts.bookId, input.bookId));
        }

        if (input.chapterNumber !== undefined) {
          whereClause = and(whereClause, eq(quizAttempts.chapterNumber, input.chapterNumber));
        }

        // Delete all matching attempts directly
        await ctx.db.delete(quizAttempts).where(whereClause);

        return { success: true };
      },
    ),

  // Get leaderboard for a specific book chapter
  getLeaderboard: publicProcedure
    .input(
      z.object({
        bookId: z.string(),
        chapterNumber: z.number(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(
      async ({
        ctx,
        input,
      }: {
        ctx: inferAsyncReturnType<typeof createTRPCContext>;
        input: { bookId: string; chapterNumber: number; limit: number };
      }) => {
        // Get the top attempts for this book and chapter
        // We need to get the best attempt per user (highest score)
        const leaderboardQuery = await ctx.db
          .select({
            userId: quizAttempts.userId,
            userName: user.name,
            userImage: user.image,
            correctAnswers: sql<number>`MAX(${quizAttempts.correctAnswers})`,
            totalQuestions: quizAttempts.totalQuestions,
            bestAccuracy: sql<number>`MAX(${quizAttempts.correctAnswers} * 100.0 / ${quizAttempts.totalQuestions})`,
            attemptCount: sql<number>`COUNT(*)`,
            lastAttemptTime: sql<Date>`MAX(${quizAttempts.timestamp})`,
          })
          .from(quizAttempts)
          .leftJoin(user, eq(quizAttempts.userId, user.id))
          .where(
            and(
              eq(quizAttempts.bookId, input.bookId),
              eq(quizAttempts.chapterNumber, input.chapterNumber),
            ),
          )
          .groupBy(quizAttempts.userId, user.name, user.image, quizAttempts.totalQuestions)
          .orderBy(
            sql`${quizAttempts.correctAnswers} * 100.0 / ${quizAttempts.totalQuestions} DESC, 
                ${quizAttempts.timestamp} ASC`,
          )
          .limit(input.limit);

        return leaderboardQuery.map((entry) => ({
          userId: entry.userId,
          userName: entry.userName || "Anonymous User",
          userImage: entry.userImage,
          correctAnswers: Number(entry.correctAnswers),
          totalQuestions: entry.totalQuestions,
          accuracy: Math.round(Number(entry.bestAccuracy)),
          attemptCount: Number(entry.attemptCount),
          lastAttemptTime:
            entry.lastAttemptTime instanceof Date
              ? entry.lastAttemptTime.getTime()
              : Number(entry.lastAttemptTime),
        }));
      },
    ),
});
