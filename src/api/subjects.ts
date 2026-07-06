import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { Subject } from "../types/models";

export async function getSubjects(): Promise<Subject[]> {
  const { data } = await apiClient.get<ApiResponse<Subject[]>>("/subjects");
  return data.data;
}
