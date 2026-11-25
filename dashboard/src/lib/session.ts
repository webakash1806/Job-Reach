// Edge-safe access-token helpers (used by middleware and server code).
import { SignJWT, jwtVerify } from "jose";

/** Short-lived JWT sent with every request. */
export const ACCESS_COOKIE = "jo_at";
/** Long-lived opaque token, only sent to /api/auth/* and rotated on every use. */
export const REFRESH_COOKIE = "jo_rt";
/** Cookie from the old single-token setup; cleared on sign-in. */
export const LEGACY_COOKIE = "jo_session";

export const ACCESS_TTL_SEC = 15 * 60;

export type AccessPayload = { sub: string; email: string; role: "admin" | "user"; sid: string };

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signAccess(p: AccessPayload) {
  return new SignJWT({ email: p.email, role: p.role, sid: p.sid, typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(secret());
}

export async function verifyAccess(token?: string): Promise<AccessPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.typ !== "access" || !payload.sub || !payload.sid) return null;
    return {
      sub: payload.sub,
      email: payload.email as string,
      role: payload.role as AccessPayload["role"],
      sid: payload.sid as string,
    };
  } catch {
    return null;
  }
}
