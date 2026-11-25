import { NextResponse } from "next/server";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { deleteFile, readFile } from "@/lib/gridfs";
import { Resume } from "@/lib/models";

type Ctx = { params: Promise<{ id: string }> };

// Download / preview
export const GET = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const r = await Resume.findOne({ _id: id, userId: user._id });
  if (!r) throw new HttpError(404, "Not found");
  const buf = await readFile(r.gridFsId);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": r.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(r.filename)}"`,
    },
  });
});

// Make default
export const PATCH = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const r = await Resume.findOne({ _id: id, userId: user._id });
  if (!r) throw new HttpError(404, "Not found");
  await Resume.updateMany({ userId: user._id }, { isDefault: false });
  r.isDefault = true;
  await r.save();
  return NextResponse.json({ ok: true });
});

export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const r = await Resume.findOneAndDelete({ _id: id, userId: user._id });
  if (!r) throw new HttpError(404, "Not found");
  await deleteFile(r.gridFsId);
  return NextResponse.json({ ok: true });
});
