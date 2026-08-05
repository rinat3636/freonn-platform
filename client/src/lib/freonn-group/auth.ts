import { freonnFetch } from "./api";
import { clearTokens, setTokens } from "./auth-storage";

export type FreonnUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

export async function exchangeHandoff(handoffToken: string) {
  const data = await freonnFetch<{
    accessToken: string;
    refreshToken: string;
    user: FreonnUser;
  }>("/api/v1/auth/handoff/exchange", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ handoff: handoffToken }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function loginEmail(email: string, password: string) {
  const data = await freonnFetch<{
    accessToken: string;
    refreshToken: string;
    user: FreonnUser;
  }>("/api/v1/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function sendOtp(phone: string) {
  return freonnFetch<{ success: boolean }>("/api/v1/auth/otp/send", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, code: string, name?: string) {
  const data = await freonnFetch<{
    accessToken: string;
    refreshToken: string;
    user: FreonnUser;
    isNewUser?: boolean;
  }>("/api/v1/auth/otp/verify", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ phone, code, name }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function registerAccount(input: {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
}) {
  const data = await freonnFetch<{
    accessToken: string;
    refreshToken: string;
    user: FreonnUser;
  }>("/api/v1/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(input),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function fetchAccountMe() {
  return freonnFetch<{
    user: FreonnUser;
    cashback: { balance: number };
  }>("/api/v1/account/me");
}

export function logoutFreonn() {
  clearTokens();
}
