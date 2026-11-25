import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureAdmin, handler, HttpError } from "@/lib/auth";
import { User } from "@/lib/models";
import { createSession, setAuthCookies } from "@/lib/tokens";

const Body = z.object({ email: z.string().email(), password: z.string().min(1) });

// Equal-cost check for unknown emails so response time does not reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync("timing-equaliser-not-a-password", 10);

export const POST = handler(async (req: Request) => {
  await ensureAdmin();
  const { email, password } = Body.parse(await req.json());
  const user = await User.findOne({ email: email.toLowerCase() });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Wrong email or password");
  if (!user.active) throw new HttpError(403, "This account is disabled");

  const { access, refresh } = await createSession(user, req);
  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, access, refresh);
  return res;
});
