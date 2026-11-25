import { z } from "zod";

export const TemplateBody = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(["initial", "followup"]),
  subject: z.string().max(300).default(""),
  body: z.string().min(1).max(20000),
});

const hhmm = z.string().regex(/^(\d{1,2}:\d{2})?$/).default("");

export const TimingBody = z.object({
  intervalMode: z.enum(["fixed", "random"]).default("random"),
  intervalSec: z.coerce.number().min(10).max(86400).default(90),
  minSec: z.coerce.number().min(10).max(86400).default(60),
  maxSec: z.coerce.number().min(10).max(86400).default(180),
  dailyCap: z.coerce.number().min(1).max(2000).default(100),
  windowStart: hhmm,
  windowEnd: hhmm,
  tzOffset: z.coerce.number().min(-900).max(900).default(0),
});

export const CampaignBody = TimingBody.extend({
  name: z.string().min(1).max(120),
  templateId: z.string().min(1),
  resumeId: z.string().optional().nullable(),
  startAt: z.coerce.date(),
  contactIds: z.array(z.string()).optional(),
  allNew: z.boolean().optional(),
  followUp: z
    .object({
      enabled: z.boolean().default(false),
      afterDays: z.coerce.number().min(1).max(60).default(3),
      templateId: z.string().optional().nullable(),
      maxCount: z.coerce.number().min(1).max(5).default(1),
      attachResume: z.boolean().default(false),
    })
    .default({ enabled: false, afterDays: 3, maxCount: 1, attachResume: false }),
});
