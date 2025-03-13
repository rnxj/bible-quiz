"use client";

import { ProgressBar } from "@/components/quiz/progress-bar";
import { QuizCard } from "@/components/quiz/quiz-card";
import { ScoreDisplay } from "@/components/quiz/score-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuizData } from "@/hooks/use-quiz-data";
import type { Locale } from "@/i18n/config";
import type { QuizResult, QuizSummary } from "@/types/quiz";
import { ArrowLeft, Book, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define the quiz states
type QuizState = "start" | "quiz" | "result";

const Quiz = () => {
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;
  const chapterNumber = params.chapterNumber as string;
  const locale = useLocale() as Locale;
  const t = useTranslations("Quiz");

  // State machine state
  const [quizState, setQuizState] = useState<QuizState>("start");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [summary, setSummary] = useState<QuizSummary | null>(null);

  const { quizData, loading, error } = useQuizData(
    bookId,
    Number.parseInt(chapterNumber, 10),
    locale,
  );

  useEffect(() => {
    // If direct navigation without params, redirect to home
    if (!bookId || !chapterNumber) {
      router.push("/");
    }
  }, [bookId, chapterNumber, router]);

  // If quiz data is loading, show loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, repeatType: "reverse" }}
        >
          {t("loading")}
        </motion.div>
      </div>
    );
  }

  // If there was an error loading the quiz data
  if (error || !quizData) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-destructive">{t("errorLoading")}</div>
      </div>
    );
  }

  // Get current question with necessary book and chapter properties
  const currentQuestion = quizData.questions[currentQuestionIndex]
    ? {
        ...quizData.questions[currentQuestionIndex],
        book: quizData.book,
        chapter: quizData.chapter,
      }
    : null;

  // If no current question, redirect to home
  if (!currentQuestion) {
    router.push("/");
    return null;
  }

  // Find user's answer for current question
  const currentResult = results.find((r) => r.questionId === currentQuestion.id);

  // Progress percentage
  const progress = isReviewing
    ? currentQuestionIndex + 1
    : results.filter((r) => r.userAnswer !== null).length;

  // Handle answer submission
  const handleAnswer = (questionId: number, selectedOption: number) => {
    const question = quizData.questions.find((q) => q.id === questionId);

    if (!question) return;

    const isCorrect = selectedOption === question.correctAnswer;
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

    // Update results
    setResults((prev) => {
      const existingResultIndex = prev.findIndex((r) => r.questionId === questionId);

      if (existingResultIndex >= 0) {
        const newResults = [...prev];
        newResults[existingResultIndex] = {
          questionId,
          userAnswer: selectedOption,
          isCorrect,
        };
        return newResults;
      }

      return [
        ...prev,
        {
          questionId,
          userAnswer: selectedOption,
          isCorrect,
        },
      ];
    });

    // Auto advance to next question after a delay based on correctness
    // Don't auto-advance on the last question
    if (!isReviewing && !isLastQuestion) {
      const delay = isCorrect ? 1000 : 2000; // 1s for correct, 2s for incorrect
      setTimeout(() => {
        handleNextQuestion();
      }, delay);
    }
  };

  // Handle next question navigation
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else if (!isReviewing && results.length === quizData.questions.length) {
      // All questions answered, go to results
      calculateSummary();
      setQuizState("result");
    }
  };

  // Handle previous question navigation
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Check if all questions answered
  const allQuestionsAnswered = results.length === quizData.questions.length;

  // Start review mode
  const startReview = () => {
    setIsReviewing(true);
    setCurrentQuestionIndex(0);
  };

  // Calculate summary data for results
  const calculateSummary = () => {
    const totalQuestions = quizData.questions.length;
    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = correctAnswers / totalQuestions;

    setSummary({
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      results,
    });
  };

  // Finish quiz
  const finishQuiz = () => {
    calculateSummary();
    setQuizState("result");
  };

  // Start the quiz
  const startQuiz = () => {
    setQuizState("quiz");
    setCurrentQuestionIndex(0);
    setResults([]);
    setIsReviewing(false);
  };

  // Go back to books
  const goBack = () => {
    router.push("/");
  };

  // Restart quiz
  const restartQuiz = () => {
    setQuizState("start");
    setCurrentQuestionIndex(0);
    setResults([]);
    setIsReviewing(false);
    setSummary(null);
  };

  // Render the start screen
  const renderStartScreen = () => {
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

          <div>
            <Card className="glass-panel border border-accent/50 mb-8">
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
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <div>
                  <Button size="lg" onClick={startQuiz} className="relative overflow-hidden">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    <span className="relative z-10">{t("startQuiz")}</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <p className="text-sm text-muted-foreground text-center">{t("bibleVerse")}</p>
        </div>
      </div>
    );
  };

  // Render the quiz screen
  const renderQuizScreen = () => {
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

  // Render the result screen
  const renderResultScreen = () => {
    if (!summary || !quizData) {
      console.log("No summary or quiz data in renderResultScreen");
      return (
        <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
          <div className="text-muted-foreground">Loading results...</div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-65px)] py-12">
        <div className="w-full max-w-3xl mx-auto px-4">
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-3xl font-bold text-center mb-1">{t("quizCompleted")}</h1>
            <p className="text-center text-muted-foreground">
              {quizData.book} {t("chapter", { number: quizData.chapter })}
            </p>
          </div>

          <div>
            <ScoreDisplay summary={summary} className="mb-8" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <div>
              <Button variant="outline" onClick={restartQuiz} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                {t("tryAgain")}
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

  switch (quizState) {
    case "start":
      return renderStartScreen();
    case "quiz":
      return renderQuizScreen();
    case "result":
      return renderResultScreen();
    default:
      return renderStartScreen();
  }
};

export default Quiz;
