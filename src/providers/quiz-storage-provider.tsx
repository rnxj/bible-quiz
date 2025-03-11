"use client";

import { useQuizStorage } from "@/hooks/use-quiz-storage";
import type { QuizAttempt } from "@/store/quiz-history";
import { type ReactNode, createContext, useContext } from "react";

// Define the context type
interface QuizStorageContextType {
  addAttempt: (attemptData: Omit<QuizAttempt, "id" | "timestamp">) => Promise<QuizAttempt>;
  getAttempts: (bookId: string, chapterNumber: number) => Promise<QuizAttempt[]>;
  getLatestAttempt: (bookId: string, chapterNumber: number) => Promise<QuizAttempt | null>;
  useGetAttempts: (
    bookId: string,
    chapterNumber: number,
  ) => {
    data: QuizAttempt[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => Promise<unknown>;
  };
  useGetLatestAttempt: (
    bookId: string,
    chapterNumber: number,
  ) => {
    data: QuizAttempt | null | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => Promise<unknown>;
  };
  clearHistory: (bookId?: string, chapterNumber?: number) => Promise<void>;
  syncStatus: "idle" | "syncing" | "success" | "error";
  isSynced: boolean;
}

// Create the context with a default value
const QuizStorageContext = createContext<QuizStorageContextType | null>(null);

// Provider component
export function QuizStorageProvider({ children }: { children: ReactNode }) {
  const quizStorage = useQuizStorage();

  return <QuizStorageContext.Provider value={quizStorage}>{children}</QuizStorageContext.Provider>;
}

// Hook to use the quiz storage context
export function useQuizStorageContext() {
  const context = useContext(QuizStorageContext);
  if (!context) {
    throw new Error("useQuizStorageContext must be used within a QuizStorageProvider");
  }
  return context;
}
