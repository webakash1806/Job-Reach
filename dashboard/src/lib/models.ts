import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const { ObjectId } = Schema.Types;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    active: { type: Boolean, default: true },
    apiKey: { type: String, index: true, sparse: true },
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      user: String,
      passEnc: String,
      fromName: String,
      fromEmail: String,
    },
    imap: {
      enabled: { type: Boolean, default: false },
      host: String,
      port: Number,
      secure: { type: Boolean, default: true },
      user: String,
      passEnc: String,
    },
    lastImapUid: { type: Number, default: 0 },
    lastImapCheck: Date,
    lastImapError: String,
    lastSentAt: Date,
    extensionLastSeenAt: Date,
    extensionVersion: String,
  },
  { timestamps: true }
);

const contactSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    company: { type: String, default: "" },
    postUrl: String,
    postSnippet: String,
    keyword: String,
    source: { type: String, enum: ["extension", "manual", "csv"], default: "extension" },
    status: {
      type: String,
      enum: ["new", "queued", "sent", "replied", "bounced"],
      default: "new",
      index: true,
    },
    followUpCount: { type: Number, default: 0 },
    lastSentAt: Date,
    repliedAt: Date,
  },
  { timestamps: true }
);
contactSchema.index({ userId: 1, email: 1 }, { unique: true });

const resumeSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true, index: true },
    filename: { type: String, required: true },
    contentType: String,
    size: Number,
    gridFsId: { type: ObjectId, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const templateSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["initial", "followup"], default: "initial" },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

const campaignSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    templateId: { type: ObjectId, ref: "Template", required: true },
    resumeId: { type: ObjectId, ref: "Resume" },
    startAt: { type: Date, required: true },
    intervalMode: { type: String, enum: ["fixed", "random"], default: "random" },
    intervalSec: { type: Number, default: 90 },
    minSec: { type: Number, default: 60 },
    maxSec: { type: Number, default: 180 },
    dailyCap: { type: Number, default: 100 },
    windowStart: { type: String, default: "" }, // "09:00" or "" for any time
    windowEnd: { type: String, default: "" },
    tzOffset: { type: Number, default: 0 }, // Date#getTimezoneOffset() of the creator
    followUp: {
      enabled: { type: Boolean, default: false },
      afterDays: { type: Number, default: 3 },
      templateId: { type: ObjectId, ref: "Template" },
      maxCount: { type: Number, default: 1 },
      attachResume: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["running", "paused", "done", "cancelled"],
      default: "running",
      index: true,
    },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const emailJobSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true, index: true },
    campaignId: { type: ObjectId, ref: "Campaign", index: true },
    contactId: { type: ObjectId, ref: "Contact", required: true, index: true },
    to: { type: String, required: true },
    type: { type: String, enum: ["initial", "followup"], default: "initial" },
    templateId: { type: ObjectId, ref: "Template", required: true },
    resumeId: { type: ObjectId, ref: "Resume" },
    scheduledAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "paused", "sending", "sent", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    messageId: { type: String, index: true },
    subject: String,
    sentAt: Date,
    error: String,
  },
  { timestamps: true }
);
emailJobSchema.index({ status: 1, scheduledAt: 1 });

// One document per signed-in browser. The refresh token itself is never stored, only its hash.
const sessionSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    prevHash: { type: String, index: true }, // previous token, for reuse detection + multi-tab grace
    rotatedAt: Date,
    userAgent: String,
    ip: String,
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }, // sliding refresh expiry
    absoluteExpiresAt: { type: Date, required: true }, // hard cap, re-login after this
    revokedAt: Date,
    revokedReason: String,
  },
  { timestamps: true }
);
// MongoDB deletes sessions a week after they can no longer be used
sessionSchema.index({ absoluteExpiresAt: 1 }, { expireAfterSeconds: 7 * 86400 });

function model<T extends Schema>(name: string, schema: T) {
  return (mongoose.models[name] as Model<InferSchemaType<T>>) ?? mongoose.model(name, schema);
}

export const User = model("User", userSchema);
export const Contact = model("Contact", contactSchema);
export const Resume = model("Resume", resumeSchema);
export const Template = model("Template", templateSchema);
export const Campaign = model("Campaign", campaignSchema);
export const EmailJob = model("EmailJob", emailJobSchema);
export const Session = model("Session", sessionSchema);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
