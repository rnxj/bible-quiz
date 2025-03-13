"use client";

import type { Locale } from "@/i18n/config";
import { getAvailableBooks, getBookById, getChapterInfo, loadQuizData } from "@/lib/quiz-loader";
import type { BookInfo, ChapterInfo, QuizData } from "@/types/quiz";
import { useEffect, useState } from "react";

export function useAvailableBooks(locale: Locale) {
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const data = await getAvailableBooks(locale);
        setBooks(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch books"));
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [locale]);

  return { books, loading, error };
}

export function useBookData(bookId: string, locale: Locale) {
  const [book, setBook] = useState<BookInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        const data = await getBookById(bookId, locale);
        setBook(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching book ${bookId}:`, err);
        setError(err instanceof Error ? err : new Error(`Failed to fetch book ${bookId}`));
      } finally {
        setLoading(false);
      }
    }

    if (bookId) {
      fetchBook();
    }
  }, [bookId, locale]);

  return { book, loading, error };
}

export function useChapterInfo(bookId: string, chapterNumber: number, locale: Locale) {
  const [chapter, setChapter] = useState<ChapterInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchChapter() {
      try {
        setLoading(true);
        const data = await getChapterInfo(bookId, chapterNumber, locale);
        setChapter(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching chapter ${chapterNumber} of book ${bookId}:`, err);
        setError(
          err instanceof Error
            ? err
            : new Error(`Failed to fetch chapter ${chapterNumber} of book ${bookId}`),
        );
      } finally {
        setLoading(false);
      }
    }

    if (bookId && chapterNumber) {
      fetchChapter();
    }
  }, [bookId, chapterNumber, locale]);

  return { chapter, loading, error };
}

export function useQuizData(bookId: string, chapterNumber: number, locale: Locale) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchQuizData() {
      try {
        setLoading(true);
        const data = await loadQuizData(bookId, chapterNumber, locale);
        setQuizData(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching quiz data for ${bookId} chapter ${chapterNumber}:`, err);
        setError(
          err instanceof Error
            ? err
            : new Error(`Failed to fetch quiz data for ${bookId} chapter ${chapterNumber}`),
        );
      } finally {
        setLoading(false);
      }
    }

    if (bookId && chapterNumber) {
      fetchQuizData();
    }
  }, [bookId, chapterNumber, locale]);

  return { quizData, loading, error };
}
