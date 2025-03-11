import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData, QuizQuestion, QuizResult } from "@/types/quiz";

/**
 * Calculate the number of correct answers for a quiz attempt
 */
export function calculateCorrectAnswers(attempt: QuizAttempt, quizData: QuizData): number {
  return attempt.results.filter((r: QuizResult) => {
    const question = quizData.questions.find((q: QuizQuestion) => q.id === r.questionId);
    return question && r.userAnswer === question.correctAnswer;
  }).length;
}

/**
 * Calculate the accuracy percentage (0-100) for a quiz attempt
 */
export function calculateAccuracyPercentage(attempt: QuizAttempt, quizData: QuizData): number {
  const correctAnswers = calculateCorrectAnswers(attempt, quizData);
  return Math.round((correctAnswers / attempt.totalQuestions) * 100);
}

/**
 * Calculate the accuracy as a decimal (0-1) for a quiz attempt
 */
export function calculateAccuracy(attempt: QuizAttempt, quizData: QuizData): number {
  const correctAnswers = calculateCorrectAnswers(attempt, quizData);
  return correctAnswers / attempt.totalQuestions;
}

/**
 * Calculate a summary of quiz results
 */
export function calculateQuizSummary(results: QuizResult[], quizData: QuizData) {
  const totalQuestions = quizData.questions.length;

  // Calculate correct answers by checking each result against the quiz data
  const correctAnswers = results.filter((r: QuizResult) => {
    const question = quizData.questions.find((q: QuizQuestion) => q.id === r.questionId);
    return question && r.userAnswer === question.correctAnswer;
  }).length;

  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = correctAnswers / totalQuestions;

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    results,
  };
}

/**
 * Calculate improvement between attempts
 */
export function calculateImprovement(attempts: QuizAttempt[], quizData: QuizData) {
  if (attempts.length < 2) return null;

  // Sort by timestamp (oldest first)
  const sortedAttempts = [...attempts].sort((a, b) => a.timestamp - b.timestamp);

  // Get first and latest attempt
  const firstAttempt = sortedAttempts[0];
  const latestAttempt = sortedAttempts[sortedAttempts.length - 1];

  // Calculate improvement
  const firstAccuracy = Math.round(calculateAccuracy(firstAttempt, quizData) * 100);
  const latestAccuracy = Math.round(calculateAccuracy(latestAttempt, quizData) * 100);
  const diff = latestAccuracy - firstAccuracy;

  return {
    diff,
    improving: diff > 0,
    attempts: sortedAttempts.length,
  };
}
