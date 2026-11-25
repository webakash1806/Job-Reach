import { NextResponse } from "next/server";
import { handler, requireUser } from "@/lib/auth";
import { EmailJob } from "@/lib/models";

// Sent history + queue. ?status=sent|failed|pending|all  ?type=initial|followup
export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "sent";
  const type = url.searchParams.get("type");
  const filter: Record<string, unknown> = { userId: user._id };
  if (status !== "all") filter.status = status === "pending" ? { $in: ["pending", "paused", "sending"] } : status;
  if (type) filter.type = type;
  const jobs = await EmailJob.find(filter)
    .sort(status === "pending" ? { scheduledAt: 1 } : { sentAt: -1, updatedAt: -1 })
    .limit(3000)
    .populate("contactId", "email name company status followUpCount")
    .populate("campaignId", "name")
    .lean();
  return NextResponse.json({ jobs });
});
