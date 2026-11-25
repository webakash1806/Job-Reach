import { NextResponse } from "next/server";
import { handler, requireUser } from "@/lib/auth";
import { Template } from "@/lib/models";
import { TemplateBody } from "@/lib/schemas";

export const GET = handler(async () => {
  const user = await requireUser();
  const templates = await Template.find({ userId: user._id }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ templates });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const data = TemplateBody.parse(await req.json());
  const template = await Template.create({ ...data, userId: user._id });
  return NextResponse.json({ template });
});
