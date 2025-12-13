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
    // Draft fields - stores pending changes for published content
    draftTitle: { type: String },
    draftData: { type: Schema.Types.Mixed },
    hasDraft: { type: Boolean, default: false },
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

// Media Schema - for storing uploaded videos and images
const mediaSchema = new Schema(
  {
    siteId: { type: String, required: true, index: true },
    mediaId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    type: {
      type: String,
      enum: ["video", "image"],
      required: true,
      index: true,
    },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // in bytes
    url: { type: String, required: true }, // base64 or external URL
    thumbnailUrl: { type: String }, // thumbnail for videos
    metadata: {
      width: Number,
      height: Number,
      duration: Number, // for videos, in seconds
      aspectRatio: String,
    },
    folder: { type: String, default: "root", index: true },
    tags: [{ type: String }],
    alt: { type: String }, // alt text for accessibility
    description: { type: String },
  },
  { timestamps: true },
)

mediaSchema.index({ siteId: 1, type: 1 })
mediaSchema.index({ siteId: 1, folder: 1 })
mediaSchema.index({ siteId: 1, tags: 1 })

// Create or get models
const Website = mongoose.models.Website || mongoose.model("Website", websiteSchema)
const ContentType = mongoose.models.ContentType || mongoose.model("ContentType", contentTypeSchema)
const Content = mongoose.models.Content || mongoose.model("Content", contentSchema)
const FormSubmission = mongoose.models.FormSubmission || mongoose.model("FormSubmission", formSubmissionSchema)
const User = mongoose.models.User || mongoose.model("User", userSchema)
const Webhook = mongoose.models.Webhook || mongoose.model("Webhook", webhookSchema)
const WebhookLog = mongoose.models.WebhookLog || mongoose.model("WebhookLog", webhookLogSchema)
const Revision = mongoose.models.Revision || mongoose.model("Revision", revisionSchema)
const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema)

export { Website, ContentType, Content, FormSubmission, User, Webhook, WebhookLog, Revision, Media }
