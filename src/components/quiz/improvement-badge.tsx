"use client";

import { Badge } from "@/components/ui/badge";
import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData } from "@/types/quiz";
import { calculateImprovement } from "@/utils/quiz-calculations";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

interface ImprovementBadgeProps {
  attempts: QuizAttempt[];
  quizData: QuizData;
  className?: string;
}

export function ImprovementBadge({ attempts, quizData, className = "" }: ImprovementBadgeProps) {
  const improvement = useMemo(() => {
    return calculateImprovement(attempts, quizData);
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
