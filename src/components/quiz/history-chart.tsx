"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData } from "@/types/quiz";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface HistoryChartProps {
  attempts: QuizAttempt[];
  quizData: QuizData;
  className?: string;
}

export function HistoryChart({ attempts, quizData, className = "" }: HistoryChartProps) {
  const t = useTranslations("Quiz");

  // Sort attempts by timestamp (oldest first for the chart)
  const sortedAttempts = useMemo(() => {
    return [...attempts].sort((a, b) => a.timestamp - b.timestamp);
  }, [attempts]);

  // Calculate trend data
  const trendData = useMemo(() => {
    if (sortedAttempts.length < 2) return null;

    // Helper function to calculate accuracy for an attempt
    const calculateAccuracy = (attempt: QuizAttempt): number => {
      const correctCount = attempt.results.filter((r) => {
        const question = quizData.questions.find((q) => q.id === r.questionId);
        return question && r.userAnswer === question.correctAnswer;
      }).length;
      return correctCount / attempt.totalQuestions;
    };

    const accuracyTrend = sortedAttempts.map((attempt) =>
      Math.round(calculateAccuracy(attempt) * 100),
    );
    const firstAccuracy = accuracyTrend[0];
    const lastAccuracy = accuracyTrend[accuracyTrend.length - 1];
    const improvement = lastAccuracy - firstAccuracy;

    return {
      accuracyTrend,
      improvement,
      improving: improvement > 0,
    };
  }, [sortedAttempts, quizData]);

  // If there's only one attempt, don't show the chart
  if (attempts.length < 2) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{t("progressOverTime")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple visual representation of progress */}
          <div className="h-16 w-full flex items-end gap-1">
            {trendData?.accuracyTrend.map((accuracy, index) => (
              <div
                key={`accuracy-bar-${sortedAttempts[index].id}`}
                className="flex-1 bg-primary/80 rounded-t"
                style={{
                  height: `${Math.max(10, accuracy)}%`,
                  opacity: 0.3 + (index / sortedAttempts.length) * 0.7,
                }}
                title={`${accuracy}%`}
              />
            ))}
          </div>

          {/* Trend information */}
          {trendData && (
            <div className="text-sm">
              <p className={trendData.improving ? "text-green-500" : "text-red-500"}>
                {trendData.improving
                  ? `+${trendData.improvement}% ${t("improvement")}`
                  : `${trendData.improvement}% ${t("decrease")}`}
              </p>
              <p className="text-muted-foreground text-xs mt-1">{t("comparedToFirstAttempt")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
