import { NextResponse } from "next/server";
import { handler, HttpError, requireUser } from "@/lib/auth";
import { uploadFile } from "@/lib/gridfs";
import { Resume } from "@/lib/models";

const MAX = 5 * 1024 * 1024;
const OK = /\.(pdf|docx?|rtf|txt)$/i;

export const GET = handler(async () => {
  const user = await requireUser();
  const resumes = await Resume.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ resumes });
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No file uploaded");
  if (!OK.test(file.name)) throw new HttpError(400, "Upload a PDF, DOC or DOCX file");
  if (file.size > MAX) throw new HttpError(400, "File is larger than 5 MB");
  const buf = Buffer.from(await file.arrayBuffer());
  const gridFsId = await uploadFile(buf, file.name, file.type || "application/octet-stream");
  const isFirst = (await Resume.countDocuments({ userId: user._id })) === 0;
  const resume = await Resume.create({
    userId: user._id,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    size: file.size,
    gridFsId,
    isDefault: isFirst,
  });
  return NextResponse.json({ resume });
});
