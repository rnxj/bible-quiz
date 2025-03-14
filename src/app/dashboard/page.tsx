"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { formatDate } from "@/utils/date-format";
import { BarChartIcon, BookOpenIcon, CalendarIcon, FlameIcon, TrophyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define types for the activity and book objects
interface ActivityItem {
  id: string;
  book: string;
  chapterNumber: number;
  timestamp: number;
}

interface BookStat {
  bookId: string;
  bookName: string;
  totalAttempts: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const session = authClient.useSession();
  const t = useTranslations("Dashboard");

  // Fetch dashboard stats using React Query
  const { data: stats, isLoading: isLoadingStats } = api.quiz.getDashboardStats.useQuery(
    undefined,
    {
      enabled: !!session?.data?.user,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  // Fetch book stats using React Query
  const { data: bookStats, isLoading: isLoadingBookStats } = api.quiz.getBookStats.useQuery(
    undefined,
    {
      enabled: !!session?.data?.user,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  // Redirect to login if not authenticated
  if (!session.data && !session.isPending) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("welcome", { name: session.data?.user?.name?.split(" ")[0] || "User" })}
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/quiz">
            <BookOpenIcon className="h-4 w-4" />
            {t("startNewQuiz")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalQuizzes")}</CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">{t("quizzesCompleted")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("correctAnswers")}</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalCorrectAnswers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">{t("questionsAnsweredCorrectly")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("accuracy")}</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.accuracy || 0}%</div>
            )}
            <p className="text-xs text-muted-foreground">{t("accuracyRate")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("streak")}</CardTitle>
            <FlameIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.streak || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">{t("currentStreak")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("lastQuiz")}</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-full" />
            ) : stats?.latestQuiz ? (
              <>
                <div className="text-2xl font-bold">{stats.latestQuiz.book}</div>
                <p className="text-xs text-muted-foreground">
                  {t("chapter", { number: stats.latestQuiz.chapterNumber })} •{" "}
                  {formatDate(stats.latestQuiz.timestamp, "relative")}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">{t("noQuizzesTaken")}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
            <CardDescription>{t("quizHistory")}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[100px]">
            {isLoadingStats ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <ScrollArea className="h-[140px] pr-4">
                <div className="space-y-4">
                  {stats.recentActivity.map((activity: ActivityItem) => (
                    <div
                      key={activity.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{activity.book}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("chapter", { number: activity.chapterNumber })}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(activity.timestamp, "relative")}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center flex flex-col items-center justify-center h-full">
                <p className="text-muted-foreground mb-4">{t("noQuizzesTakenYet")}</p>
                <Button asChild variant="outline">
                  <Link href="/quiz">{t("startFirstQuiz")}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t("yourProfile")}</CardTitle>
            <CardDescription>{t("accountInfo")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.data?.user?.image || ""} alt="Profile" />
                <AvatarFallback>{session.data?.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{session.data?.user?.name || "User"}</h3>
                <p className="text-muted-foreground">{session.data?.user?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("joined")}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" size="sm">
              {t("editProfile")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                authClient.signOut();
                router.push("/auth/login");
              }}
            >
              {t("signOut")}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Book Statistics Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t("bookStatistics")}</h2>
        <div className="grid gap-4">
          {isLoadingBookStats ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : bookStats && bookStats.length > 0 ? (
            bookStats.map((book: BookStat) => (
              <Card key={book.bookId} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{book.bookName}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("attempts")}: {book.totalAttempts}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("correct")}: {book.correctAnswers}/{book.totalQuestions}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{t("accuracy")}</span>
                        <span className="text-sm font-medium">{book.accuracy}%</span>
                      </div>
                      <Progress value={book.accuracy} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">{t("noBookStats")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
