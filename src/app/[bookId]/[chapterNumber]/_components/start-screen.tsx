import { ImprovementBadge } from "@/components/quiz/improvement-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Locale } from "@/i18n/config";
import type { QuizAttempt } from "@/store/quiz-history";
import type { QuizData } from "@/types/quiz";
import { formatDate } from "@/utils/date-format";
import { calculateAccuracyPercentage, calculateCorrectAnswers } from "@/utils/quiz-calculations";
import { ArrowLeft, Book, BookOpen, History, PlayCircle, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Leaderboard } from "./leaderboard";

interface StartScreenProps {
  bookId: string;
  quizData: QuizData;
  latestAttempt: QuizAttempt | null;
  allAttempts: QuizAttempt[];
  startQuiz: () => void;
  viewHistory: () => void;
  locale: Locale;
}

export const StartScreen = ({
  quizData,
  latestAttempt,
  allAttempts,
  startQuiz,
  viewHistory,
}: StartScreenProps) => {
  const router = useRouter();
  const t = useTranslations("Quiz");
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard">("overview");

  // Go back to books
  const goBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl mx-auto">
        <div>
          <Button variant="ghost" className="mb-8" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToBooks")}
          </Button>
        </div>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-4 mb-4 rounded-full bg-primary/10">
            <Book className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
            {quizData.book}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("chapter", { number: quizData.chapter })}
          </p>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "overview" | "leaderboard")}
          className="mb-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t("quizOverview")}
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              {t("leaderboard")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <Card className="glass-panel border border-accent/50">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">{t("quizOverview")}</CardTitle>
                <CardDescription>
                  {t("questionsFromChapter", {
                    count: quizData.questions.length,
                    chapter: quizData.chapter,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {quizData.description || t("defaultDescription")}
                </p>

                <div className="bg-accent/20 rounded-lg p-4 text-sm">
                  <h3 className="font-medium mb-2">{t("instructions")}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t("instructionsList.item1")}</li>
                    <li>{t("instructionsList.item2")}</li>
                    <li>{t("instructionsList.item3")}</li>
                    <li>{t("instructionsList.item4")}</li>
                    <li>{t("instructionsList.item5")}</li>
                  </ul>
                </div>

                {latestAttempt && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{t("previousAttempt")}</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(latestAttempt.timestamp, "relative")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">
                          {t("score")}: {calculateAccuracyPercentage(latestAttempt, quizData)}%
                        </p>
                        <p className="text-sm">
                          {t("correct")}: {calculateCorrectAnswers(latestAttempt, quizData)}/
                          {latestAttempt.totalQuestions}
                        </p>
                        {allAttempts.length >= 2 && (
                          <div className="mt-1">
                            <ImprovementBadge attempts={allAttempts} quizData={quizData} />
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={viewHistory}>
                        <History className="h-4 w-4 mr-1" />
                        {t("viewResults")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <div>
                  <Button size="lg" onClick={startQuiz} className="relative overflow-hidden">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    <span className="relative z-10">
                      {latestAttempt ? t("retakeQuiz") : t("startQuiz")}
                    </span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <Leaderboard limit={20} />
          </TabsContent>
        </Tabs>

        <p className="text-sm text-muted-foreground text-center">{t("bibleVerse")}</p>
      </div>
    </div>
  );
};
