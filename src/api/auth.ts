import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";

export interface LoginPayload {
  userId: string;
  password: string;
}

export interface AuthUser {
  id: string;
  userId: string;
  name: string;
  role: string;
  subrole?: string;
}

export interface LoginData {
  token: string;
  user: AuthUser;
}

export async function login(payload: LoginPayload): Promise<LoginData> {
  const { data } = await apiClient.post<ApiResponse<LoginData>>(
    "/auth/login",
    payload
  );
  return data.data;
}
