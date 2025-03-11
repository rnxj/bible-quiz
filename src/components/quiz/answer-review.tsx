"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { QuizData, QuizResult } from "@/types/quiz";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface AnswerReviewProps {
  results: QuizResult[];
  quizData: QuizData;
  className?: string;
}

export function AnswerReview({ results, quizData, className = "" }: AnswerReviewProps) {
  const t = useTranslations("Quiz");

  // Sort results by questionId to ensure they're in the right order
  const sortedResults = [...results].sort((a, b) => a.questionId - b.questionId);

  // If no results are available, show a message
  if (!results.length) {
    return (
      <div className={`text-center text-muted-foreground p-4 ${className}`}>
        {t("scoreDisplay.noDetailedAnswers")}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium mb-2">{t("scoreDisplay.yourAnswers")}</h3>

      {sortedResults.map((result, index) => {
        // Find the question data from quizData
        const question = quizData.questions.find((q) => q.id === result.questionId);

        // Skip if question not found
        if (!question) return null;

        // Calculate if the answer is correct
        const isCorrect = result.userAnswer === question.correctAnswer;

        // Get the question text and options
        const questionText = question.question;
        const selectedOption =
          result.userAnswer !== null ? question.options[result.userAnswer] : null;
        const correctOption = question.options[question.correctAnswer];

        return (
          <Card key={`answer-${result.questionId}`} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium mb-2">
                      {index + 1}. {questionText}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {isCorrect ? t("scoreDisplay.correct") : t("scoreDisplay.incorrect")}
                    </span>
                  </div>

                  {selectedOption && (
                    <div
                      className={`p-2 rounded-md text-sm mb-1 ${
                        isCorrect
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-red-500/10 text-red-700 dark:text-red-400"
                      }`}
                    >
                      <p>
                        <span className="font-medium">{t("scoreDisplay.yourAnswer")}: </span>
                        {selectedOption}
                      </p>
                    </div>
                  )}

                  {!isCorrect && correctOption && (
                    <div className="p-2 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
                      <p>
                        <span className="font-medium">{t("scoreDisplay.correctAnswer")}: </span>
                        {correctOption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
