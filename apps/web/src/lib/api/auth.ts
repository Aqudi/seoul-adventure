import { LoginBody, AuthResponse, RegisterBody } from "@seoul-advanture/schemas";
import { apiClient } from "./client";

/**
 * 로그인 API
 */
export async function login(body: LoginBody): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * 회원가입 API
 */
export async function register(body: RegisterBody): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
