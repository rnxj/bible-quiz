import type { QuizResult } from "@/types/quiz";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Define the structure for a quiz attempt
export interface QuizAttempt {
  id: string;
  bookId: string;
  book: string;
  chapterNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  results: QuizResult[];
  timestamp: number;
}

// Define the store state
interface QuizHistoryState {
  attempts: Record<string, QuizAttempt[]>; // Keyed by bookId_chapterNumber
  addAttempt: (attempt: Omit<QuizAttempt, "id" | "timestamp">) => void;
  getAttempts: (bookId: string, chapterNumber: number) => QuizAttempt[];
  getLatestAttempt: (bookId: string, chapterNumber: number) => QuizAttempt | null;
  clearHistory: (bookId?: string, chapterNumber?: number) => void;
}

// Create the quiz history store
export const useQuizHistory = create<QuizHistoryState>()(
  persist(
    (set, get) => ({
      attempts: {},

      // Add a new quiz attempt
      addAttempt: (attempt) => {
        const key = `${attempt.bookId}_${attempt.chapterNumber}`;
        const timestamp = Date.now();
        const id = `${key}_${timestamp}`;

        set((state) => {
          const existingAttempts = state.attempts[key] || [];
          return {
            attempts: {
              ...state.attempts,
              [key]: [
                ...existingAttempts,
                {
                  id,
                  ...attempt,
                  timestamp,
                },
              ],
            },
          };
        });
      },

      // Get all attempts for a specific book chapter
      getAttempts: (bookId, chapterNumber) => {
        const key = `${bookId}_${chapterNumber}`;
        const attempts = get().attempts[key] || [];

        // Ensure all attempts have the correctAnswers field
        return attempts.map((attempt) => ({
          ...attempt,
          correctAnswers: attempt.correctAnswers || 0, // Default to 0 if not present
        }));
      },

      // Get the most recent attempt for a specific book chapter
      getLatestAttempt: (bookId, chapterNumber) => {
        const attempts = get().getAttempts(bookId, chapterNumber);
        if (attempts.length === 0) return null;

        // Sort by timestamp in descending order and return the first one
        return [...attempts].sort((a, b) => b.timestamp - a.timestamp)[0];
      },

      // Clear history - either all history, or for a specific book/chapter
      clearHistory: (bookId, chapterNumber) => {
        if (!bookId) {
          // Clear all history
          set({ attempts: {} });
          return;
        }

        if (chapterNumber !== undefined) {
          // Clear history for a specific book chapter
          const key = `${bookId}_${chapterNumber}`;
          set((state) => ({
            attempts: Object.fromEntries(Object.entries(state.attempts).filter(([k]) => k !== key)),
          }));
          return;
        }

        // Clear history for all chapters of a specific book
        set((state) => {
          const newAttempts: Record<string, QuizAttempt[]> = {};
          for (const key in state.attempts) {
            if (!key.startsWith(`${bookId}_`)) {
              newAttempts[key] = state.attempts[key];
            }
          }
          return { attempts: newAttempts };
        });
      },
    }),
    {
      name: "bible-quiz-history",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
