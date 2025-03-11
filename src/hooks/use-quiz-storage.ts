import { authClient } from "@/lib/auth-client";
import type { QuizAttempt } from "@/store/quiz-history";
import { useQuizHistory } from "@/store/quiz-history";
import { api } from "@/trpc/react";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook to provide access to quiz data storage
 * Uses localStorage when not logged in, and the database when logged in
 */
export function useQuizStorage() {
  const session = authClient.useSession();
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [isSynced, setIsSynced] = useState(false);

  // TRPC mutations
  const addAttemptMutation = api.quiz.addAttempt.useMutation();
  const syncLocalStorageMutation = api.quiz.syncLocalStorage.useMutation();
  const clearHistoryMutation = api.quiz.clearHistory.useMutation();

  // Get the TRPC context
  const trpc = api.useContext();

  // Sync localStorage data to the database when a user logs in
  useEffect(() => {
    const syncData = async () => {
      if (!session.isPending && session.data?.user?.id && !isSynced) {
        try {
          setSyncStatus("syncing");

          // Get all attempts from localStorage
          const localStorageAttempts = useQuizHistory.getState().attempts;
          const attemptsToSync: QuizAttempt[] = [];

          // Flatten the attempts object into an array
          for (const key in localStorageAttempts) {
            attemptsToSync.push(...localStorageAttempts[key]);
          }

          if (attemptsToSync.length > 0) {
            // Sync to database
            await syncLocalStorageMutation.mutateAsync(attemptsToSync);

            // Clear localStorage after successful sync
            useQuizHistory.getState().clearHistory();
          }

          setSyncStatus("success");
          setIsSynced(true);
        } catch (error) {
          console.error("Error syncing quiz data:", error);
          setSyncStatus("error");
        }
      }
    };

    syncData();
  }, [session.isPending, session.data?.user?.id, isSynced, syncLocalStorageMutation]);

  /**
   * Add a new quiz attempt
   */
  const addAttempt = useCallback(
    async (attemptData: Omit<QuizAttempt, "id" | "timestamp">): Promise<QuizAttempt> => {
      let newAttempt: QuizAttempt;

      if (!session.isPending && session.data?.user?.id) {
        // User is logged in, store in database via API
        try {
          newAttempt = await addAttemptMutation.mutateAsync(attemptData);

          // Invalidate relevant queries to force a refetch
          await trpc.quiz.getAttempts.invalidate({
            bookId: attemptData.bookId,
            chapterNumber: attemptData.chapterNumber,
          });

          await trpc.quiz.getLatestAttempt.invalidate({
            bookId: attemptData.bookId,
            chapterNumber: attemptData.chapterNumber,
          });

          // Also invalidate dashboard stats and book stats
          await trpc.quiz.getDashboardStats.invalidate();
          await trpc.quiz.getBookStats.invalidate();

          return newAttempt;
        } catch (error) {
          console.error("Error adding attempt to database:", error);
          // Fallback to localStorage if database fails
          useQuizHistory.getState().addAttempt(attemptData);
          newAttempt = {
            id: `${attemptData.bookId}_${attemptData.chapterNumber}_${Date.now()}`,
            ...attemptData,
            timestamp: Date.now(),
          };
          return newAttempt;
        }
      } else {
        // User is not logged in, store in localStorage
        useQuizHistory.getState().addAttempt(attemptData);

        // Create a new attempt object to return
        newAttempt = {
          id: `${attemptData.bookId}_${attemptData.chapterNumber}_${Date.now()}`,
          ...attemptData,
          timestamp: Date.now(),
        };
        return newAttempt;
      }
    },
    [
      session.isPending,
      session.data?.user?.id,
      addAttemptMutation,
      trpc.quiz.getAttempts,
      trpc.quiz.getLatestAttempt,
      trpc.quiz.getDashboardStats,
      trpc.quiz.getBookStats,
    ],
  );

  /**
   * Get all attempts for a specific book chapter using React Query
   */
  const useGetAttempts = (bookId: string, chapterNumber: number) => {
    const isLoggedIn = !session.isPending && session.data?.user?.id;

    // Use TRPC query if logged in
    const query = api.quiz.getAttempts.useQuery(
      { bookId, chapterNumber },
      {
        enabled: !!isLoggedIn,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    );

    // Get data from localStorage if not logged in
    const localStorageAttempts = !isLoggedIn
      ? useQuizHistory.getState().getAttempts(bookId, chapterNumber)
      : [];

    return {
      data: isLoggedIn ? query.data : localStorageAttempts,
      isLoading: isLoggedIn ? query.isLoading : false,
      isError: isLoggedIn ? query.isError : false,
      error: query.error,
      refetch: query.refetch,
    };
  };

  /**
   * Get the latest attempt for a specific book chapter using React Query
   */
  const useGetLatestAttempt = (bookId: string, chapterNumber: number) => {
    const isLoggedIn = !session.isPending && session.data?.user?.id;

    // Use TRPC query if logged in
    const query = api.quiz.getLatestAttempt.useQuery(
      { bookId, chapterNumber },
      {
        enabled: !!isLoggedIn,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    );

    // Get data from localStorage if not logged in
    const latestAttempt = !isLoggedIn
      ? useQuizHistory.getState().getLatestAttempt(bookId, chapterNumber)
      : null;

    return {
      data: isLoggedIn ? query.data : latestAttempt,
      isLoading: isLoggedIn ? query.isLoading : false,
      isError: isLoggedIn ? query.isError : false,
      error: query.error,
      refetch: query.refetch,
    };
  };

  /**
   * Get all attempts for a specific book chapter (legacy method)
   */
  const getAttempts = useCallback(
    async (bookId: string, chapterNumber: number): Promise<QuizAttempt[]> => {
      if (!session.isPending && session.data?.user?.id) {
        // User is logged in, get from database via API
        try {
          const result = await trpc.quiz.getAttempts.fetch({ bookId, chapterNumber });
          return result;
        } catch (error) {
          console.error("Error fetching attempts:", error);
          // If database query fails, try to get from localStorage as fallback
          return useQuizHistory.getState().getAttempts(bookId, chapterNumber);
        }
      }

      // User is not logged in, get from localStorage
      return useQuizHistory.getState().getAttempts(bookId, chapterNumber);
    },
    [session.isPending, session.data?.user?.id, trpc.quiz.getAttempts],
  );

  /**
   * Get the most recent attempt for a specific book chapter (legacy method)
   */
  const getLatestAttempt = useCallback(
    async (bookId: string, chapterNumber: number): Promise<QuizAttempt | null> => {
      if (!session.isPending && session.data?.user?.id) {
        // User is logged in, get from database via API
        try {
          const result = await trpc.quiz.getLatestAttempt.fetch({ bookId, chapterNumber });
          return result;
        } catch (error) {
          console.error("Error fetching latest attempt:", error);
          // If database query fails, try to get from localStorage as fallback
          return useQuizHistory.getState().getLatestAttempt(bookId, chapterNumber);
        }
      }

      // User is not logged in, get from localStorage
      return useQuizHistory.getState().getLatestAttempt(bookId, chapterNumber);
    },
    [session.isPending, session.data?.user?.id, trpc.quiz.getLatestAttempt],
  );

  /**
   * Clear history - either all history, or for a specific book/chapter
   */
  const clearHistory = useCallback(
    async (bookId?: string, chapterNumber?: number): Promise<void> => {
      if (!session.isPending && session.data?.user?.id) {
        // User is logged in, clear from database via API
        try {
          await clearHistoryMutation.mutateAsync({
            bookId,
            chapterNumber: chapterNumber !== undefined ? chapterNumber : undefined,
          });

          // Invalidate queries after clearing history
          if (bookId && chapterNumber !== undefined) {
            await trpc.quiz.getAttempts.invalidate({ bookId, chapterNumber });
            await trpc.quiz.getLatestAttempt.invalidate({ bookId, chapterNumber });
          } else {
            // If clearing all history, invalidate all quiz queries
            await trpc.quiz.invalidate();
          }
        } catch (error) {
          console.error("Error clearing history from database:", error);
        }
      }

      // Always clear from localStorage as well
      useQuizHistory.getState().clearHistory(bookId, chapterNumber);
    },
    [session.isPending, session.data?.user?.id, clearHistoryMutation, trpc.quiz],
  );

  // Expose the storage methods
  return {
    addAttempt,
    getAttempts,
    getLatestAttempt,
    useGetAttempts,
    useGetLatestAttempt,
    clearHistory,
    syncStatus,
    isSynced,
  };
}
