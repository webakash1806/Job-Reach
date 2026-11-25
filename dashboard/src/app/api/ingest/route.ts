import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Contact, User } from "@/lib/models";

// Called by the Chrome extension with the user's API key.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-extension-version",
};

const Item = z.object({
  email: z.string().email(),
  name: z.string().max(200).optional().default(""),
  company: z.string().max(200).optional().default(""),
  postUrl: z.string().max(1000).optional(),
  postSnippet: z.string().max(2000).optional(),
  keyword: z.string().max(300).optional(),
});
const Body = z.object({ items: z.array(Item).max(500) });

async function userFromKey(req: Request) {
  const key = req.headers.get("x-api-key");
  if (!key) return null;
  await connectDB();
  const user = await User.findOne({ apiKey: key, active: true });
  if (user) {
    // powers the "extension connected" check on the setup page
    const version = req.headers.get("x-extension-version")?.slice(0, 20);
    await User.updateOne({ _id: user._id }, { extensionLastSeenAt: new Date(), ...(version ? { extensionVersion: version } : {}) });
  }
  return user;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

// GET = connection test from the extension popup
export async function GET(req: Request) {
  const user = await userFromKey(req);
  if (!user) return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: cors });
  return NextResponse.json({ ok: true, email: user.email }, { headers: cors });
}

export async function POST(req: Request) {
  try {
    const user = await userFromKey(req);
    if (!user) return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: cors });
    const { items } = Body.parse(await req.json());
    if (!items.length) return NextResponse.json({ inserted: 0, duplicates: 0 }, { headers: cors });
    const res = await Contact.bulkWrite(
      items.map((i) => ({
        updateOne: {
          filter: { userId: user._id, email: i.email.toLowerCase() },
          update: {
            $setOnInsert: {
              userId: user._id,
              email: i.email.toLowerCase(),
              name: i.name,
              company: i.company,
              postUrl: i.postUrl,
              postSnippet: i.postSnippet,
              keyword: i.keyword,
              source: "extension",
              status: "new",
            },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );
    const inserted = res.upsertedCount;
    return NextResponse.json({ inserted, duplicates: items.length - inserted }, { headers: cors });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400, headers: cors });
  }
}
