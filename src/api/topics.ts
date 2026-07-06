import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { Topic } from "../types/models";

export async function getTopicsBySubject(subjectId: string): Promise<Topic[]> {
  const { data } = await apiClient.get<ApiResponse<Topic[]>>(
    `/topics/subject/${subjectId}`
  );
  return data.data;
}
