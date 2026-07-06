import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { SubTopic } from "../types/models";

export async function getSubTopicsByTopic(topicId: string): Promise<SubTopic[]> {
  const { data } = await apiClient.get<ApiResponse<SubTopic[]>>(
    `/sub-topics/topic/${topicId}`
  );
  return data.data;
}

export async function getSubTopicsByTopics(
  topicIds: string[]
): Promise<SubTopic[]> {
  const { data } = await apiClient.post<ApiResponse<SubTopic[]>>(
    "/sub-topics/multi-topics",
    { topicIds }
  );
  return data.data;
}
