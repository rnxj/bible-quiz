import { ProgressBar } from "@/components/quiz/progress-bar";
import { QuizCard } from "@/components/quiz/quiz-card";
import { Button } from "@/components/ui/button";
import type { QuizResult } from "@/types/quiz";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { QuizQuestionWithContext } from "./quiz-state-types";

interface QuizScreenProps {
  quizData: {
    book: string;
    chapter: number;
    questions: QuizQuestionWithContext[];
  };
  currentQuestionIndex: number;
  results: QuizResult[];
  isReviewing: boolean;
  allQuestionsAnswered: boolean;
  handleAnswer: (questionId: number, selectedOption: number) => void;
  handlePreviousQuestion: () => void;
  handleNextQuestion: () => void;
  startReview: () => void;
  finishQuiz: () => void;
}

export const QuizScreen = ({
  quizData,
  currentQuestionIndex,
  results,
  isReviewing,
  allQuestionsAnswered,
  handleAnswer,
  handlePreviousQuestion,
  handleNextQuestion,
  startReview,
  finishQuiz,
}: QuizScreenProps) => {
  const t = useTranslations("Quiz");

  // Get current question
  const currentQuestion = quizData.questions[currentQuestionIndex];

  // Find user's answer for current question
  const currentResult = results.find((r) => r.questionId === currentQuestion.id);

  // Progress percentage
  const progress = isReviewing
    ? currentQuestionIndex + 1
    : results.filter((r) => r.userAnswer !== null).length;

  return (
    <div className="min-h-[calc(100vh-65px)]">
      <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 min-h-[calc(100vh-8rem)]">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {quizData.book} {t("chapter", { number: quizData.chapter })}
            </h1>
            <span className="text-sm text-muted-foreground">
              {t("question", {
                current: currentQuestionIndex + 1,
                total: quizData.questions.length,
              })}
            </span>
          </div>

          <div>
            <ProgressBar current={progress} total={quizData.questions.length} className="mb-8" />
          </div>

          <div>
            <QuizCard
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              showResult={Boolean(currentResult?.userAnswer !== null) || isReviewing}
              userAnswer={currentResult?.userAnswer || null}
            />
          </div>

          <div className="flex justify-between mt-8">
            <div>
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("previous")}
              </Button>
            </div>

            <div className="flex gap-2">
              {allQuestionsAnswered && !isReviewing && (
                <div>
                  <Button variant="outline" onClick={startReview}>
                    {t("reviewAnswers")}
                  </Button>
                </div>
              )}

              {isReviewing && currentQuestionIndex === quizData.questions.length - 1 && (
                <div>
                  <Button onClick={finishQuiz}>{t("seeResults")}</Button>
                </div>
              )}

              {!isReviewing && allQuestionsAnswered ? (
                <div>
                  <Button onClick={finishQuiz}>{t("finishQuiz")}</Button>
                </div>
              ) : (
                <div>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={
                      (!isReviewing && (!currentResult || currentResult.userAnswer === null)) ||
                      (currentQuestionIndex === quizData.questions.length - 1 &&
                        !allQuestionsAnswered)
                    }
                    className="flex items-center gap-1"
                  >
                    {t("next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
