import { HistoryChart } from "@/components/quiz/history-chart";
import { ImprovementBadge } from "@/components/quiz/improvement-badge";
import { ScoreDisplay } from "@/components/quiz/score-display";
import { Button } from "@/components/ui/button";
import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData } from "@/types/quiz";
import { formatDate } from "@/utils/date-format";
import { calculateAccuracyPercentage, calculateCorrectAnswers } from "@/utils/quiz-calculations";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface HistoryScreenProps {
  quizData: QuizData;
  allAttempts: QuizAttempt[];
  selectedAttemptId: string | null;
  setSelectedAttemptId: (id: string) => void;
  startQuiz: () => void;
}

export const HistoryScreen = ({
  quizData,
  allAttempts,
  selectedAttemptId,
  setSelectedAttemptId,
  startQuiz,
}: HistoryScreenProps) => {
  const router = useRouter();
  const t = useTranslations("Quiz");

  // Find the selected attempt
  const selectedAttempt =
    allAttempts.find((attempt) => attempt.id === selectedAttemptId) || allAttempts[0];

  // Go back to books
  const goBack = () => {
    router.push("/");
  };

  if (!selectedAttempt) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-muted-foreground">No quiz attempts found</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] py-6">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div>
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-center mb-1">{t("quizHistory")}</h1>
          <p className="text-center text-muted-foreground">
            {quizData.book} {t("chapter", { number: quizData.chapter })}
          </p>
          {allAttempts.length >= 2 && (
            <div className="mt-2">
              <ImprovementBadge attempts={allAttempts} quizData={quizData} />
            </div>
          )}
        </div>

        {/* Progress chart at the top if there are multiple attempts */}
        {allAttempts.length >= 2 && (
          <HistoryChart attempts={allAttempts} quizData={quizData} className="mb-6" />
        )}

        {/* Previous Attempts Title - Separate from the grid */}
        <h2 className="text-lg font-semibold mb-3">{t("previousAttempts")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left side: Attempt selection */}
          <div className="md:col-span-1">
            <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
              {allAttempts
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((attempt, index) => {
                  const correctCount = calculateCorrectAnswers(attempt, quizData);
                  const accuracy = calculateAccuracyPercentage(attempt, quizData);

                  return (
                    <Button
                      key={attempt.id}
                      variant={attempt.id === selectedAttemptId ? "secondary" : "outline"}
                      className="w-full justify-start h-auto py-2 px-3 text-left"
                      onClick={() => setSelectedAttemptId(attempt.id)}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium truncate">
                            {index === 0
                              ? t("latestAttempt")
                              : t("attempt", { number: allAttempts.length - index })}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {formatDate(attempt.timestamp, "short")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">
                              <span className="font-medium">{correctCount}</span>
                              <span className="text-muted-foreground">
                                /{attempt.totalQuestions}
                              </span>
                            </span>
                          </div>

                          <div className="text-xs font-medium px-1.5 py-0.5 rounded-sm bg-primary/10">
                            {accuracy}%
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
            </div>
          </div>

          {/* Right side: Score display */}
          <div className="md:col-span-2">
            <ScoreDisplay attempt={selectedAttempt} quizData={quizData} />
          </div>
        </div>

        {/* Action buttons at the bottom */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={startQuiz}
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("retakeQuiz")}
          </Button>
          <Button onClick={goBack} size="sm">
            {t("returnHome")}
          </Button>
        </div>
      </div>
    </div>
  );
};
