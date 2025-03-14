"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData } from "@/types/quiz";
import { calculateAccuracyPercentage, calculateCorrectAnswers } from "@/utils/quiz-calculations";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AnswerReview } from "./answer-review";

interface ScoreDisplayProps {
  attempt: QuizAttempt;
  quizData: QuizData;
}

export function ScoreDisplay({ attempt, quizData }: ScoreDisplayProps) {
  const t = useTranslations("Quiz");
  const [showAnswers, setShowAnswers] = useState(false);

  // Calculate correct answers and score percentage using our utility functions
  const correctCount = calculateCorrectAnswers(attempt, quizData);
  const totalQuestions = attempt.results.length;
  const scorePercentage = calculateAccuracyPercentage(attempt, quizData);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">{t("scoreDisplay.yourScore")}</h2>
          <div className="text-4xl font-bold">
            {correctCount} / {totalQuestions}
          </div>
          <div className="text-xl mt-1">
            {scorePercentage}% {t("correct")}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {t("scoreDisplay.completedOn", {
              date: new Date(attempt.timestamp).toLocaleDateString(),
              time: new Date(attempt.timestamp).toLocaleTimeString(),
            })}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mb-4"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? t("scoreDisplay.hideAnswers") : t("scoreDisplay.showAnswers")}
        </Button>

        {showAnswers && <AnswerReview results={attempt.results} quizData={quizData} />}
      </CardContent>
    </Card>
  );
}
