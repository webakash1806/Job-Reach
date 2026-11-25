import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, requireUser } from "@/lib/auth";
import { Contact } from "@/lib/models";
import { TimingBody } from "@/lib/schemas";
import { alreadyContacted, computeTimes } from "@/lib/scheduler";

const Body = TimingBody.extend({
  contactIds: z.array(z.string()).optional(),
  allNew: z.boolean().optional(),
  startAt: z.coerce.date(),
});

// Shows how many contacts will be skipped (already emailed) and the estimated send window.
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const b = Body.parse(await req.json());
  const filter: Record<string, unknown> = { userId: user._id };
  if (b.allNew) filter.status = "new";
  else filter._id = { $in: b.contactIds ?? [] };
  const contacts = await Contact.find(filter).select("_id").lean();
  const skip = await alreadyContacted(user._id, contacts.map((c) => c._id));
  const n = contacts.length - skip.size;
  const times = n > 0 ? computeTimes(n, b.startAt, b) : [];
  return NextResponse.json({
    selected: contacts.length,
    skipped: skip.size,
    willSend: n,
    firstAt: times[0] ?? null,
    lastAt: times[times.length - 1] ?? null,
  });
});
