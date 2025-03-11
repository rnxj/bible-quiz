"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData } from "@/types/quiz";
import { calculateAccuracy } from "@/utils/quiz-calculations";
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

    const accuracyTrend = sortedAttempts.map((attempt) =>
      Math.round(calculateAccuracy(attempt, quizData) * 100),
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
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{t("progressChart")}</h3>

        {/* Simple visual representation of progress */}
        <div className="h-16 w-full flex items-end gap-1 mb-4">
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

        {trendData && (
          <div className="mt-4 text-center">
            <p className="text-sm">
              {trendData.improving
                ? t("improvementPositive", { value: trendData.improvement })
                : t("improvementNegative", { value: Math.abs(trendData.improvement) })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
