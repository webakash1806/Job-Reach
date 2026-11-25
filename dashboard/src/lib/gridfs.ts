import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectDB } from "./db";

async function bucket() {
  await connectDB();
  return new GridFSBucket(mongoose.connection.db!, { bucketName: "resumes" });
}

export async function uploadFile(buf: Buffer, filename: string, contentType: string) {
  const b = await bucket();
  return new Promise<ObjectId>((resolve, reject) => {
    const stream = b.openUploadStream(filename, { metadata: { contentType } });
    stream.on("error", reject);
    stream.on("finish", () => resolve(stream.id as ObjectId));
    stream.end(buf);
  });
}

export async function readFile(id: string | ObjectId) {
  const b = await bucket();
  const chunks: Buffer[] = [];
  for await (const c of b.openDownloadStream(new ObjectId(String(id)))) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
}

export async function deleteFile(id: string | ObjectId) {
  const b = await bucket();
  await b.delete(new ObjectId(String(id))).catch(() => {});
}
