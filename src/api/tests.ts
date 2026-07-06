import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { TestRecord, TestPayload } from "../types/models";

export async function getTests(): Promise<TestRecord[]> {
  const { data } = await apiClient.get<ApiResponse<TestRecord[]>>("/tests");
  return data.data;
}

export async function getTestById(id: string): Promise<TestRecord> {
  const { data } = await apiClient.get<ApiResponse<TestRecord>>(
    `/tests/${id}`
  );
  return data.data;
}

export async function createTest(payload: TestPayload): Promise<TestRecord> {
  const { data } = await apiClient.post<ApiResponse<TestRecord>>(
    "/tests",
    payload
  );
  return data.data;
}

export async function updateTest(
  id: string,
  payload: Partial<TestPayload>
): Promise<TestRecord> {
  const { data } = await apiClient.put<ApiResponse<TestRecord>>(
    `/tests/${id}`,
    payload
  );
  return data.data;
}

export async function publishTest(id: string): Promise<TestRecord> {
  return updateTest(id, { status: "live" });
}
