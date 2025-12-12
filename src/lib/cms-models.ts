import mongoose, { Schema } from "mongoose"

// Website Schema
const websiteSchema = new Schema(
  {
    siteId: { type: String, required: true, unique: true, index: true },
    domain: { type: String, required: true },
    name: { type: String, required: true },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
)

// Content Type Schema
const contentTypeSchema = new Schema(
  {
    siteId: { type: String, required: true, index: true },
    contentTypeId: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    fields: [
      {
        fieldId: String,
        name: String,
        type: {
          type: String,
          enum: ["text", "number", "email", "url", "date", "select", "boolean", "textarea"],
        },
        required: Boolean,
        minLength: Number,
        maxLength: Number,
        pattern: String,
        options: [String],
      },
    ],
  },
  { timestamps: true },
)

contentTypeSchema.index({ siteId: 1, contentTypeId: 1 })

// Content Schema
const contentSchema = new Schema(
  {
    siteId: { type: String, required: true, index: true },
    contentTypeId: { type: String, required: true, index: true },
    contentId: { type: String, required: true },
    title: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: Date,
  },
  { timestamps: true },
)

contentSchema.index({ siteId: 1, contentTypeId: 1, status: 1 })
contentSchema.index({ siteId: 1, status: 1 })

// Form Submission Schema
const formSubmissionSchema = new Schema(
  {
    siteId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "lost"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true },
)

formSubmissionSchema.index({ siteId: 1, status: 1 })

// User Schema
const userSchema = new Schema(
  {
    siteId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "editor",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

userSchema.index({ siteId: 1, email: 1 })

// Webhook Schema
const webhookSchema = new Schema(
  {
    siteId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    events: [String],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// Webhook Log Schema
const webhookLogSchema = new Schema(
  {
    siteId: { type: String, required: true, index: true },
    webhookId: Schema.Types.ObjectId,
    event: String,
    statusCode: Number,
    response: Schema.Types.Mixed,
    error: String,
  },
  { timestamps: true },
)

webhookLogSchema.index({ siteId: 1, createdAt: -1 })

// Revision Schema
const revisionSchema = new Schema(
  {
    siteId: { type: String, required: true, index: true },
    contentId: String,
    contentTypeId: String,
    data: Schema.Types.Mixed,
    changedFields: [String],
    changedBy: String,
  },
  { timestamps: true },
)

revisionSchema.index({ siteId: 1, contentId: 1 })

// Create or get models
const Website = mongoose.models.Website || mongoose.model("Website", websiteSchema)
const ContentType = mongoose.models.ContentType || mongoose.model("ContentType", contentTypeSchema)
const Content = mongoose.models.Content || mongoose.model("Content", contentSchema)
const FormSubmission = mongoose.models.FormSubmission || mongoose.model("FormSubmission", formSubmissionSchema)
const User = mongoose.models.User || mongoose.model("User", userSchema)
const Webhook = mongoose.models.Webhook || mongoose.model("Webhook", webhookSchema)
const WebhookLog = mongoose.models.WebhookLog || mongoose.model("WebhookLog", webhookLogSchema)
const Revision = mongoose.models.Revision || mongoose.model("Revision", revisionSchema)

export { Website, ContentType, Content, FormSubmission, User, Webhook, WebhookLog, Revision }
