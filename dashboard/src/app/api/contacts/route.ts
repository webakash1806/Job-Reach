import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, requireUser } from "@/lib/auth";
import { Contact, EmailJob } from "@/lib/models";

export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status");
  const filter: Record<string, unknown> = { userId: user._id };
  if (status && status !== "all") filter.status = status;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ email: rx }, { name: rx }, { company: rx }, { keyword: rx }, { postSnippet: rx }];
  }
  const contacts = await Contact.find(filter).sort({ createdAt: -1 }).limit(5000).lean();
  return NextResponse.json({ contacts });
});

const Item = z.object({
  email: z.string().email(),
  name: z.string().optional().default(""),
  company: z.string().optional().default(""),
  keyword: z.string().optional(),
});
const Body = z.object({ items: z.array(Item).min(1).max(5000), source: z.enum(["manual", "csv"]).default("manual") });

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const { items, source } = Body.parse(await req.json());
  const res = await Contact.bulkWrite(
    items.map((i) => ({
      updateOne: {
        filter: { userId: user._id, email: i.email.toLowerCase() },
        update: { $setOnInsert: { ...i, email: i.email.toLowerCase(), userId: user._id, source, status: "new" } },
        upsert: true,
      },
    })),
    { ordered: false }
  );
  return NextResponse.json({ inserted: res.upsertedCount, duplicates: items.length - res.upsertedCount });
});

export const DELETE = handler(async (req: Request) => {
  const user = await requireUser();
  const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(await req.json());
  await EmailJob.updateMany(
    { userId: user._id, contactId: { $in: ids }, status: { $in: ["pending", "paused"] } },
    { status: "cancelled", error: "Contact deleted" }
  );
  const r = await Contact.deleteMany({ userId: user._id, _id: { $in: ids } });
  return NextResponse.json({ deleted: r.deletedCount });
});
