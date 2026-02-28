import { LoginBody, AuthResponse, RegisterBody } from "@seoul-advanture/schemas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * 로그인 API
 */
export async function login(body: LoginBody): Promise<AuthResponse> {
  // const res = await fetch(`${API_BASE_URL}/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(body),
  // });
  // if (!res.ok) throw new Error("Login failed");
  // return res.json();

  // Mock
  return {
    token: "mock-token",
    user: { id: "u1", nickname: body.nickname || "탐험가" }
  };
}

/**
 * 회원가입 API
 */
export async function register(body: RegisterBody): Promise<AuthResponse> {
  return {
    token: "mock-token",
    user: { id: "u1", nickname: body.nickname }
  };
}
