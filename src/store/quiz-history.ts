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

// Create the store with persistence
export const useQuizHistory = create<QuizHistoryState>()(
  persist(
    (set, get) => ({
      attempts: {},

      // Add a new quiz attempt
      addAttempt: (attemptData) => {
        const { bookId, chapterNumber } = attemptData;
        const key = `${bookId}_${chapterNumber}`;
        const id = `${key}_${Date.now()}`;

        const newAttempt: QuizAttempt = {
          ...attemptData,
          id,
          timestamp: Date.now(),
        };

        set((state) => {
          const existingAttempts = state.attempts[key] || [];
          return {
            attempts: {
              ...state.attempts,
              [key]: [...existingAttempts, newAttempt],
            },
          };
        });

        return newAttempt;
      },

      // Get all attempts for a specific book chapter
      getAttempts: (bookId, chapterNumber) => {
        const key = `${bookId}_${chapterNumber}`;
        const state = get();
        return state.attempts[key] || [];
      },

      // Get the most recent attempt for a specific book chapter
      getLatestAttempt: (bookId, chapterNumber) => {
        const attempts = get().getAttempts(bookId, chapterNumber);
        if (attempts.length === 0) return null;

        // Sort by timestamp (newest first) and return the first one
        return [...attempts].sort((a, b) => b.timestamp - a.timestamp)[0];
      },

      // Clear history - either all history, or for a specific book/chapter
      clearHistory: (bookId, chapterNumber) => {
        if (!bookId) {
          // Clear all history
          set({ attempts: {} });
          return;
        }

        if (bookId && chapterNumber) {
          // Clear history for specific chapter
          const key = `${bookId}_${chapterNumber}`;
          set((state) => {
            const newAttempts = { ...state.attempts };
            delete newAttempts[key];
            return { attempts: newAttempts };
          });
          return;
        }

        // Clear history for specific book (all chapters)
        set((state) => {
          const newAttempts = { ...state.attempts };
          for (const key of Object.keys(newAttempts)) {
            if (key.startsWith(`${bookId}_`)) {
              delete newAttempts[key];
            }
          }
          return { attempts: newAttempts };
        });
      },
    }),
    {
      name: "bible-quiz-history",
      storage: createJSONStorage(() => localStorage),
      // Only persist the attempts data, not the methods
      partialize: (state) => ({ attempts: state.attempts }),
    },
  ),
);
