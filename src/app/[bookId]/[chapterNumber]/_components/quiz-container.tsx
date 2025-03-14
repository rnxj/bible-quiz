import { useQuizData } from "@/hooks/use-quiz-data";
import type { Locale } from "@/i18n/config";
import { useQuizStorageContext } from "@/providers/quiz-storage-provider";
import type { QuizResult } from "@/types/quiz";
import { calculateQuizSummary } from "@/utils/quiz-calculations";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HistoryScreen } from "./history-screen";
import { QuizScreen } from "./quiz-screen";
import type { QuizState, QuizSummary } from "./quiz-state-types";
import { ResultScreen } from "./result-screen";
import { StartScreen } from "./start-screen";

export const QuizContainer = () => {
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;
  const chapterNumber = params.chapterNumber as string;
  const locale = useLocale() as Locale;
  const t = useTranslations("Quiz");

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [summary, setSummary] = useState<QuizSummary | null>(null);

  // Quiz storage context
  const { addAttempt, useGetAttempts, useGetLatestAttempt } = useQuizStorageContext();

  // Load quiz data using React Query
  const chapterNum = Number.parseInt(chapterNumber, 10);
  const {
    quizData,
    isLoading: quizDataLoading,
    isError: quizDataError,
  } = useQuizData(bookId, chapterNum, locale);

  // Use React Query hooks for attempts data
  const {
    data: attempts = [],
    isLoading: attemptsLoading,
    isError: attemptsError,
    refetch: refetchAttempts,
  } = useGetAttempts(bookId, chapterNum);

  const {
    data: latestAttempt,
    isLoading: latestAttemptLoading,
    isError: latestAttemptError,
    refetch: refetchLatestAttempt,
  } = useGetLatestAttempt(bookId, chapterNum);

  // Selected attempt state
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // Set selected attempt when latest attempt loads
  useEffect(() => {
    if (latestAttempt) {
      setSelectedAttemptId(latestAttempt.id);
    }
  }, [latestAttempt]);

  // Determine initial screen based on loaded data
  useEffect(() => {
    // Only proceed when both quiz data and attempts have loaded
    const isLoading = quizDataLoading || attemptsLoading || latestAttemptLoading;

    if (!isLoading && quizData) {
      if (latestAttempt) {
        // Calculate correct answers for the latest attempt
        const correctAnswers = latestAttempt.results.filter((r: QuizResult) => {
          const question = quizData.questions.find((q) => q.id === r.questionId);
          return question && r.userAnswer === question.correctAnswer;
        }).length;

        setSummary({
          totalQuestions: latestAttempt.totalQuestions,
          correctAnswers,
          incorrectAnswers: latestAttempt.totalQuestions - correctAnswers,
          accuracy: correctAnswers / latestAttempt.totalQuestions,
          results: latestAttempt.results,
        });

        setQuizState("history");
      } else {
        // No previous attempts, show start screen
        setQuizState("start");
      }
    }
  }, [quizDataLoading, attemptsLoading, latestAttemptLoading, quizData, latestAttempt]);

  // Refresh data when quiz state changes to "result"
  useEffect(() => {
    if (quizState === "result") {
      refetchAttempts();
      refetchLatestAttempt();
    }
  }, [quizState, refetchAttempts, refetchLatestAttempt]);

  // Loading state
  const isLoading =
    quizDataLoading || attemptsLoading || latestAttemptLoading || quizState === "loading";
  if (isLoading) {
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

  // Error state
  const hasError = quizDataError || attemptsError || latestAttemptError || !quizData;
  if (hasError) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-destructive">{t("errorLoading")}</div>
      </div>
    );
  }

  // Derived state
  const allQuestionsAnswered = results.length === quizData.questions.length;
  const currentQuestion = quizData.questions[currentQuestionIndex];

  // If no current question in quiz state, redirect to home
  if (!currentQuestion && quizState === "quiz") {
    router.push("/");
    return null;
  }

  // Event handlers
  const handleAnswer = (questionId: number, selectedOption: number) => {
    const question = quizData.questions.find((q) => q.id === questionId);
    if (!question) return;

    // Update results
    setResults((prev) => {
      const existingResultIndex = prev.findIndex((r) => r.questionId === questionId);
      if (existingResultIndex >= 0) {
        return prev.map((r, i) =>
          i === existingResultIndex ? { questionId, userAnswer: selectedOption } : r,
        );
      }
      return [...prev, { questionId, userAnswer: selectedOption }];
    });

    // Auto advance to next question after a delay
    if (!isReviewing && currentQuestionIndex < quizData.questions.length - 1) {
      const delay = selectedOption === question.correctAnswer ? 1000 : 2000;
      setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), delay);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (!isReviewing && allQuestionsAnswered) {
      finishQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const startQuiz = () => {
    setQuizState("quiz");
    setCurrentQuestionIndex(0);
    setResults([]);
    setIsReviewing(false);
  };

  const viewHistory = () => {
    setQuizState("history");
  };

  const restartQuiz = () => {
    setQuizState("start");
    setCurrentQuestionIndex(0);
    setResults([]);
    setIsReviewing(false);
    setSummary(null);
  };

  const startReview = () => {
    setIsReviewing(true);
    setCurrentQuestionIndex(0);
  };

  const finishQuiz = async () => {
    // Calculate summary
    const newSummary = calculateQuizSummary(results, quizData);
    setSummary(newSummary);

    // Save attempt
    try {
      await addAttempt({
        bookId,
        book: quizData.book,
        chapterNumber: Number.parseInt(chapterNumber, 10),
        totalQuestions: quizData.questions.length,
        correctAnswers: newSummary.correctAnswers,
        results,
      });
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
    }

    // Change state
    setQuizState("result");
  };

  // Render the appropriate screen based on state
  switch (quizState) {
    case "start":
      return (
        <StartScreen
          bookId={bookId}
          quizData={quizData}
          latestAttempt={latestAttempt || null}
          allAttempts={attempts}
          startQuiz={startQuiz}
          viewHistory={viewHistory}
          locale={locale}
        />
      );
    case "quiz":
      return (
        <QuizScreen
          quizData={{
            book: quizData.book,
            chapter: quizData.chapter,
            questions: quizData.questions.map((q) => ({
              ...q,
              book: quizData.book,
              chapter: quizData.chapter,
            })),
          }}
          currentQuestionIndex={currentQuestionIndex}
          results={results}
          isReviewing={isReviewing}
          allQuestionsAnswered={allQuestionsAnswered}
          handleAnswer={handleAnswer}
          handlePreviousQuestion={handlePreviousQuestion}
          handleNextQuestion={handleNextQuestion}
          startReview={startReview}
          finishQuiz={finishQuiz}
        />
      );
    case "result":
      return summary ? (
        <ResultScreen
          bookId={bookId}
          quizData={quizData}
          summary={summary}
          allAttempts={attempts}
          selectedAttemptId={selectedAttemptId}
          setSelectedAttemptId={setSelectedAttemptId}
          startQuiz={startQuiz}
          restartQuiz={restartQuiz}
        />
      ) : null;
    case "history":
      return (
        <HistoryScreen
          quizData={quizData}
          allAttempts={attempts}
          selectedAttemptId={selectedAttemptId}
          setSelectedAttemptId={setSelectedAttemptId}
          startQuiz={startQuiz}
        />
      );
    default:
      return (
        <StartScreen
          bookId={bookId}
          quizData={quizData}
          latestAttempt={latestAttempt || null}
          allAttempts={attempts}
          startQuiz={startQuiz}
          viewHistory={viewHistory}
          locale={locale}
        />
      );
  }
};
