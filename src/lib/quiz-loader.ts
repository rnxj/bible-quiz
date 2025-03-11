"use server";

import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/config";
import type { BookInfo, ChapterInfo, QuizData } from "@/types/quiz";

// Function to get all available books by scanning the directory structure
export async function getAvailableBooks(language: Locale = "en"): Promise<BookInfo[]> {
  try {
    // Use process.cwd() to get the correct path in both development and production
    const dataDir = path.join(process.cwd(), "src", "data", language);

    // Add error handling for directory existence
    if (!fs.existsSync(dataDir)) {
      console.error(`Data directory does not exist: ${dataDir}`);
      return [];
    }

    const bookDirs = fs
      .readdirSync(dataDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    return bookDirs.map((bookId) => {
      const bookDir = path.join(dataDir, bookId);
      const chapterFiles = fs
        .readdirSync(bookDir)
        .filter((file) => file.endsWith(".json"))
        .map((file) => Number.parseInt(file.replace(".json", ""), 10))
        .sort((a, b) => a - b);

      // Handle case where no chapter files are found
      if (chapterFiles.length === 0) {
        return {
          id: bookId,
          name: bookId, // Use bookId as fallback name
          chapters: [],
        };
      }

      // Load the first chapter to get the book name
      const firstChapterPath = path.join(bookDir, `${chapterFiles[0]}.json`);
      const firstChapterData = JSON.parse(fs.readFileSync(firstChapterPath, "utf8")) as QuizData;

      // Create chapter info for each chapter file
      const chapters: ChapterInfo[] = chapterFiles.map((chapterNum) => {
        const chapterPath = path.join(bookDir, `${chapterNum}.json`);
        const chapterData = JSON.parse(fs.readFileSync(chapterPath, "utf8")) as QuizData;

        return {
          number: chapterNum,
          description: chapterData.description || "",
          questionCount: chapterData.questions.length,
        };
      });

      return {
        id: bookId,
        name: firstChapterData.book,
        chapters,
      };
    });
  } catch (error) {
    console.error("Error loading available books:", error);
    return [];
  }
}

// Load quiz data for a specific book, chapter, and language
export async function loadQuizData(
  bookId: string,
  chapterNumber: number,
  language: Locale = "en",
): Promise<QuizData> {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      language,
      bookId,
      `${chapterNumber}.json`,
    );

    // Add error handling for file existence
    if (!fs.existsSync(filePath)) {
      console.error(`Quiz data file does not exist: ${filePath}`);
      throw new Error(`Quiz data not found for ${bookId} chapter ${chapterNumber}`);
    }

    const quizData = JSON.parse(fs.readFileSync(filePath, "utf8")) as QuizData;
    return quizData;
  } catch (error) {
    console.error(`Error loading quiz data for ${bookId} chapter ${chapterNumber}:`, error);

    // Return a placeholder for error cases
    return {
      book: "Error Loading Data",
      chapter: chapterNumber,
      questions: [],
      description: "There was an error loading the quiz data. Please try again later.",
    };
  }
}

export async function getBookById(
  bookId: string,
  language: Locale = "en",
): Promise<BookInfo | undefined> {
  return (await getAvailableBooks(language)).find((book) => book.id === bookId);
}

export async function getChapterInfo(
  bookId: string,
  chapterNumber: number,
  language: Locale = "en",
): Promise<ChapterInfo | undefined> {
  const book = await getBookById(bookId, language);
  return book?.chapters.find((chapter) => chapter.number === chapterNumber);
}
