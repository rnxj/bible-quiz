"use client";

import { Badge } from "@/components/ui/badge";
import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData } from "@/types/quiz";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface ImprovementBadgeProps {
  attempts: QuizAttempt[];
  quizData: QuizData;
  className?: string;
}

export function ImprovementBadge({ attempts, quizData, className = "" }: ImprovementBadgeProps) {
  const improvement = useMemo(() => {
    if (attempts.length < 2) return null;

    // Helper function to calculate accuracy for an attempt
    const calculateAccuracy = (attempt: QuizAttempt): number => {
      const correctCount = attempt.results.filter((r) => {
        const question = quizData.questions.find((q) => q.id === r.questionId);
        return question && r.userAnswer === question.correctAnswer;
      }).length;
      return correctCount / attempt.totalQuestions;
    };

    // Sort by timestamp (oldest first)
    const sortedAttempts = [...attempts].sort((a, b) => a.timestamp - b.timestamp);

    // Get first and latest attempt
    const firstAttempt = sortedAttempts[0];
    const latestAttempt = sortedAttempts[sortedAttempts.length - 1];

    // Calculate improvement
    const firstAccuracy = Math.round(calculateAccuracy(firstAttempt) * 100);
    const latestAccuracy = Math.round(calculateAccuracy(latestAttempt) * 100);
    const diff = latestAccuracy - firstAccuracy;

    return {
      diff,
      improving: diff > 0,
      attempts: sortedAttempts.length,
    };
  }, [attempts, quizData]);

  if (!improvement || attempts.length < 2) {
    return null;
  }

  // Don't show badge if no improvement or decline
  if (improvement.diff === 0) {
    return null;
  }

  return (
    <Badge
      variant={improvement.improving ? "default" : "destructive"}
      className={`flex items-center gap-1 ${className}`}
    >
      {improvement.improving ? (
        <>
          <TrendingUp className="h-3 w-3" />
          <span>+{improvement.diff}%</span>
        </>
      ) : (
        <>
          <TrendingDown className="h-3 w-3" />
          <span>{improvement.diff}%</span>
        </>
      )}
    </Badge>
  );
}
