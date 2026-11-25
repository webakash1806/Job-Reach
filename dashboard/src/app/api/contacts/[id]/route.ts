import { NextResponse } from "next/server";
import { z } from "zod";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { Contact } from "@/lib/models";

const Body = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["new", "queued", "sent", "replied", "bounced"]).optional(),
});

export const PATCH = handler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await params;
  const data = Body.parse(await req.json());
  const c = await Contact.findOneAndUpdate({ _id: id, userId: user._id }, data, { new: true });
  if (!c) throw new HttpError(404, "Contact not found");
  return NextResponse.json({ contact: c });
});
