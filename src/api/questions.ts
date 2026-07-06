import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { QuestionPayload, QuestionRecord } from "../types/models";

export async function createQuestionsBulk(
  questions: QuestionPayload[]
): Promise<QuestionRecord[]> {
  const { data } = await apiClient.post<ApiResponse<QuestionRecord[]>>(
    "/questions/bulk",
    { questions }
  );
  return data.data;
}

export async function fetchQuestionsBulk(
  questionIds: string[]
): Promise<QuestionRecord[]> {
  if (questionIds.length === 0) return [];
  const { data } = await apiClient.post<ApiResponse<QuestionRecord[]>>(
    "/questions/fetchBulk",
    { question_ids: questionIds }
  );
  return data.data;
}
