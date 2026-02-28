import { Type, Static } from '@sinclair/typebox';

// ─── Request ──────────────────────────────────────────────────────────────────

export const RegisterBodySchema = Type.Object({
  nickname: Type.String({ minLength: 2, maxLength: 20 }),
  password: Type.String({ minLength: 6 }),
});
export type RegisterBody = Static<typeof RegisterBodySchema>;

export const LoginBodySchema = Type.Object({
  nickname: Type.String(),
  password: Type.String(),
});
export type LoginBody = Static<typeof LoginBodySchema>;

// ─── Response ─────────────────────────────────────────────────────────────────

export const AuthResponseSchema = Type.Object({
  token: Type.String(),
  user: Type.Object({
    id: Type.String(),
    nickname: Type.String(),
  }),
});
export type AuthResponse = Static<typeof AuthResponseSchema>;
