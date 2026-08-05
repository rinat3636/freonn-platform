import bcryptjs from "bcryptjs";
import { jwtVerify } from "jose";
import { createHmac } from "node:crypto";
import { ENV } from "./env";

const JWT_ALGORITHM = "HS256";
export const COOKIE_NAME = "app_session_id";

export type SessionPayload = {
  userId: number;
  email: string;
  role: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

function base64url(input: string | Buffer | Uint8Array): string {
  if (typeof input === "string") {
    return Buffer.from(input, "utf8").toString("base64url");
  }
  if (ArrayBuffer.isView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength).toString("base64url");
  }
  return Buffer.from(input).toString("base64url");
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    iat: now,
    exp: now + 30 * 24 * 60 * 60,
  };
  const header = { alg: JWT_ALGORITHM, typ: "JWT" };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(claims));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest();
  const encodedSignature = base64url(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(token, secret, { algorithms: [JWT_ALGORITHM] });
    if (typeof payload.userId !== "number" || typeof payload.email !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return { userId: payload.userId, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}
