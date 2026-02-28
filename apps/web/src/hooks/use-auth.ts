"use client";

import { useState } from "react";
import { login, register } from "@/lib/api/auth";
import { LoginBody, AuthResponse, RegisterBody } from "@seoul-advanture/schemas";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleLogin = async (body: LoginBody): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await login(body);
      return res;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (body: RegisterBody): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await register(body);
      return res;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, handleRegister, isLoading, error };
}
