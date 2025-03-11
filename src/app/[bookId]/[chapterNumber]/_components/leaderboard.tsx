import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuizStorageContext } from "@/providers/quiz-storage-provider";
import { Medal, Trophy, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

interface LeaderboardEntry {
  userId: string | null;
  userName: string | null;
  userImage: string | null;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  attemptCount: number;
  lastAttemptTime: number;
}

interface LeaderboardProps {
  limit?: number;
}

export const Leaderboard = ({ limit = 10 }: LeaderboardProps) => {
  const params = useParams();
  const bookId = params.bookId as string;
  const chapterNumber = Number(params.chapterNumber as string);
  const t = useTranslations("Quiz");

  // Get leaderboard data
  const { useGetLeaderboard } = useQuizStorageContext();
  const {
    data: leaderboard = [],
    isLoading,
    isError,
  } = useGetLeaderboard(bookId, chapterNumber, limit);

  if (isError) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle>{t("leaderboard")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{t("errorLoading")}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md border-t-4 border-t-yellow-500">
      <CardHeader className="pb-2 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20 dark:to-transparent">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="h-6 w-6 text-yellow-500" />
          {t("leaderboard")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <div key={`skeleton-${i}`} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          // No entries
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-3">
            <User className="h-12 w-12 text-muted-foreground/50" />
            <div>{t("noLeaderboardEntries")}</div>
          </div>
        ) : (
          // Leaderboard entries
          <div>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 mb-3 text-xs font-medium text-muted-foreground px-3 py-2 border-b">
              <div className="col-span-1">#</div>
              <div className="col-span-5">User</div>
              <div className="col-span-3 text-center">Score</div>
              <div className="col-span-3 text-right">Accuracy</div>
            </div>

            {/* Table body */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
              {leaderboard.map((entry, index) => {
                // Create a unique key that doesn't rely on index
                const entryKey = entry.userId
                  ? `${entry.userId}-${entry.lastAttemptTime}`
                  : `anonymous-${entry.lastAttemptTime}-${index}`;

                // Cast entry to LeaderboardEntry type
                const leaderboardEntry = entry as LeaderboardEntry;

                // Determine rank styling and medal
                let rankDisplay: ReactNode;
                let medalColor = "";

                if (index === 0) {
                  rankDisplay = <Medal className="h-5 w-5 fill-yellow-500 text-yellow-500" />;
                  medalColor = "from-yellow-500/20 to-transparent";
                } else if (index === 1) {
                  rankDisplay = <Medal className="h-5 w-5 fill-gray-300 text-gray-300" />;
                  medalColor = "from-gray-300/20 to-transparent";
                } else if (index === 2) {
                  rankDisplay = <Medal className="h-5 w-5 fill-amber-700 text-amber-700" />;
                  medalColor = "from-amber-700/20 to-transparent";
                } else {
                  rankDisplay = <span className="text-sm font-bold">{index + 1}</span>;
                }

                // Calculate accuracy for progress bar
                const accuracyPercent = leaderboardEntry.accuracy;

                return (
                  <div
                    key={entryKey}
                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg transition-colors hover:bg-accent/30 ${
                      index < 3 ? `bg-gradient-to-r ${medalColor} bg-opacity-50` : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 font-bold text-center">{rankDisplay}</div>

                    {/* User info */}
                    <div className="col-span-5 flex items-center gap-3">
                      <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-background shadow-sm">
                        {leaderboardEntry.userImage && (
                          <AvatarImage src={leaderboardEntry.userImage} alt="User" />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {leaderboardEntry.userName
                            ? leaderboardEntry.userName.substring(0, 2).toUpperCase()
                            : leaderboardEntry.userId
                              ? leaderboardEntry.userId.substring(0, 2).toUpperCase()
                              : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {leaderboardEntry.userName || "Anonymous User"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {leaderboardEntry.attemptCount}{" "}
                          {leaderboardEntry.attemptCount === 1 ? "attempt" : "attempts"}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-3 text-center">
                      <div className="font-medium">
                        {leaderboardEntry.correctAnswers} / {leaderboardEntry.totalQuestions}
                      </div>
                    </div>

                    {/* Accuracy */}
                    <div className="col-span-3 text-right">
                      <div className="relative">
                        <div className="text-sm font-semibold inline-block px-3 py-1 rounded-md bg-primary/10 w-full text-center">
                          {leaderboardEntry.accuracy}%
                        </div>
                        {/* Progress bar underneath */}
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-md"
                          style={{ width: `${accuracyPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
