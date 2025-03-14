import { HistoryChart } from "@/components/quiz/history-chart";
import { ImprovementBadge } from "@/components/quiz/improvement-badge";
import { ScoreDisplay } from "@/components/quiz/score-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData } from "@/types/quiz";
import { formatDate } from "@/utils/date-format";
import { calculateAccuracyPercentage, calculateCorrectAnswers } from "@/utils/quiz-calculations";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { QuizSummary } from "./quiz-state-types";

interface ResultScreenProps {
  bookId: string;
  quizData: QuizData;
  summary: QuizSummary;
  allAttempts: QuizAttempt[];
  selectedAttemptId: string | null;
  setSelectedAttemptId: (id: string) => void;
  startQuiz: () => void;
  restartQuiz: () => void;
}

export const ResultScreen = ({
  bookId,
  quizData,
  summary,
  allAttempts,
  selectedAttemptId,
  setSelectedAttemptId,
  startQuiz,
  restartQuiz,
}: ResultScreenProps) => {
  const router = useRouter();
  const t = useTranslations("Quiz");

  // Go back to books
  const goBack = () => {
    router.push("/");
  };

  // Create an attempt object from the summary for ScoreDisplay
  const currentAttempt = {
    id: "current",
    bookId,
    book: quizData.book,
    chapterNumber: Number.parseInt(quizData.chapter.toString(), 10),
    totalQuestions: summary.totalQuestions,
    results: summary.results,
    correctAnswers: summary.correctAnswers,
    timestamp: Date.now(),
  };

  return (
    <div className="min-h-[calc(100vh-65px)] py-12">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div>
          <Button variant="ghost" className="mb-8" onClick={restartQuiz}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        </div>

        <div className="flex flex-col items-center mb-10">
          <h1 className="text-3xl font-bold text-center mb-1">{t("quizCompleted")}</h1>
          <p className="text-center text-muted-foreground">
            {quizData.book} {t("chapter", { number: quizData.chapter })}
          </p>
          {allAttempts.length >= 1 && (
            <div className="mt-2">
              <ImprovementBadge attempts={allAttempts} quizData={quizData} />
            </div>
          )}
        </div>

        <div>
          <ScoreDisplay attempt={currentAttempt} quizData={quizData} />
        </div>

        {/* Add the history chart if there are previous attempts */}
        {allAttempts.length >= 1 && (
          <HistoryChart attempts={allAttempts} quizData={quizData} className="my-8" />
        )}

        {/* Show previous attempts if there are any */}
        {allAttempts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("previousAttempts")}</h2>
            <div className="space-y-4">
              {allAttempts
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((attempt, index) => (
                  <Card
                    key={attempt.id}
                    className={attempt.id === selectedAttemptId ? "border-primary" : ""}
                  >
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">
                          {index === 0
                            ? t("latestAttempt")
                            : t("attempt", { number: allAttempts.length - index })}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(attempt.timestamp, "long")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">
                            {t("score")}:{" "}
                            <span className="font-medium">
                              {calculateAccuracyPercentage(attempt, quizData)}%
                            </span>
                          </p>
                          <p className="text-sm">
                            {t("correct")}:{" "}
                            <span className="font-medium">
                              {calculateCorrectAnswers(attempt, quizData)}/{attempt.totalQuestions}
                            </span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAttemptId(attempt.id); // Update the selected attempt
                          }}
                          className={attempt.id === selectedAttemptId ? "bg-primary/10" : ""}
                        >
                          {t("view")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <div>
            <Button variant="outline" onClick={startQuiz} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              {t("retakeQuiz")}
            </Button>
          </div>

          <div>
            <Button onClick={goBack}>{t("returnHome")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
