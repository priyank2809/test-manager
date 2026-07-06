import Papa from "papaparse";
import type { CorrectOption, Difficulty, QuestionPayload } from "../types/models";

export interface CsvImportResult {
  questions: Omit<QuestionPayload, "subject" | "test_id">[];
  errors: string[];
}

const CORRECT_OPTION_MAP: Record<string, CorrectOption> = {
  option1: "option1",
  option2: "option2",
  option3: "option3",
  option4: "option4",
  a: "option1",
  b: "option2",
  c: "option3",
  d: "option4",
  "1": "option1",
  "2": "option2",
  "3": "option3",
  "4": "option4",
};

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

/**
 * CSV columns (header):
 * question, option1, option2, option3, option4, correct_option, explanation, difficulty, media_url
 */
export function parseQuestionsCsv(file: File): Promise<CsvImportResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const questions: Omit<QuestionPayload, "subject" | "test_id">[] = [];
        const errors: string[] = [];

        results.data.forEach((row, index) => {
          const rowNum = index + 2;
          const question = row.question?.trim();
          const option1 = row.option1?.trim();
          const option2 = row.option2?.trim();
          const option3 = row.option3?.trim();
          const option4 = row.option4?.trim();
          const rawCorrect = row.correct_option?.trim().toLowerCase();

          if (!question || !option1 || !option2 || !option3 || !option4) {
            errors.push(
              `Row ${rowNum}: missing question text or one of the 4 options - skipped.`
            );
            return;
          }

          const correct_option = rawCorrect
            ? CORRECT_OPTION_MAP[rawCorrect]
            : undefined;
          if (!correct_option) {
            errors.push(
              `Row ${rowNum}: correct_option "${row.correct_option ?? ""}" is invalid (expected option1-4, A-D, or 1-4) - skipped.`
            );
            return;
          }

          const rawDifficulty = row.difficulty?.trim().toLowerCase();
          const difficulty = VALID_DIFFICULTIES.includes(
            rawDifficulty as Difficulty
          )
            ? (rawDifficulty as Difficulty)
            : undefined;

          questions.push({
            type: "mcq",
            question,
            option1,
            option2,
            option3,
            option4,
            correct_option,
            explanation: row.explanation?.trim() || undefined,
            difficulty,
            media_url: row.media_url?.trim() || undefined,
          });
        });

        if (results.errors.length > 0) {
          results.errors.forEach((e) =>
            errors.push(`CSV parse error at row ${e.row ?? "?"}: ${e.message}`)
          );
        }

        resolve({ questions, errors });
      },
      error: (err) => {
        resolve({ questions: [], errors: [`Failed to read file: ${err.message}`] });
      },
    });
  });
}

export const CSV_TEMPLATE_HEADER =
  "question,option1,option2,option3,option4,correct_option,explanation,difficulty,media_url\n";

export const CSV_TEMPLATE_EXAMPLE_ROW =
  '"What is 2 + 2?","3","4","5","6","B","Basic addition","easy",""\n';