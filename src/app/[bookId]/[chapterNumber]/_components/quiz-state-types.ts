import type { QuizQuestion, QuizResult } from "@/types/quiz";

// Define the quiz states
export type QuizState = "loading" | "start" | "quiz" | "result" | "history";

// Define the summary type for internal use
export interface QuizSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  results: QuizResult[];
}

// Define the quiz data with book and chapter for a question
export interface QuizQuestionWithContext extends QuizQuestion {
  book: string;
  chapter: number;
}
