import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizSummary } from "@/types/quiz";
import { useEffect, useState } from "react";

interface ScoreDisplayProps {
  summary: QuizSummary;
  className?: string;
}

export const ScoreDisplay = ({ summary, className }: ScoreDisplayProps) => {
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowScore(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Calculate accuracy percentage
  const accuracyPercentage = Math.round(summary.accuracy * 100);

  // Determine appropriate accuracy color
  const getAccuracyColor = () => {
    if (accuracyPercentage >= 80) return "text-green-600";
    if (accuracyPercentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-semibold text-center">Quiz Results</CardTitle>
        <CardDescription className="text-center text-base">
          You&apos;ve completed the quiz! Here&apos;s how you did:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 py-4">
          <div
            className={cn(
              "flex justify-center items-center gap-4 transition-opacity duration-700",
              showScore ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="flex flex-col items-center p-4 rounded-lg bg-primary/5 min-w-32">
              <span className="text-sm text-muted-foreground mb-1">Correct</span>
              <span className="text-3xl font-bold text-green-600">{summary.correctAnswers}</span>
            </div>

            <div className="flex flex-col items-center p-4 rounded-lg bg-primary/5 min-w-32">
              <span className="text-sm text-muted-foreground mb-1">Incorrect</span>
              <span className="text-3xl font-bold text-red-600">{summary.incorrectAnswers}</span>
            </div>
          </div>

          <div className="text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
            <p className={cn("text-4xl font-bold", getAccuracyColor())}>{accuracyPercentage}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
