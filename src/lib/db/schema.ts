// Drizzle ORM Schema for Vercel Postgres
import { pgTable, text, timestamp, jsonb, varchar, serial, index, boolean } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    siteId: varchar('site_id', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    password: text('password').notNull(),
    role: varchar('role', { length: 50 }).default('editor').notNull(),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    emailSiteIdx: index('users_email_site_idx').on(table.email, table.siteId),
    userIdIdx: index('users_user_id_idx').on(table.userId),
}));

// Content Types table
export const contentTypes = pgTable('content_types', {
    id: serial('id').primaryKey(),
    siteId: varchar('site_id', { length: 255 }).notNull(),
    contentTypeId: varchar('content_type_id', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    fields: jsonb('fields').notNull(), // Array of field definitions
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    siteContentTypeIdx: index('content_types_site_content_type_idx').on(table.siteId, table.contentTypeId),
}));

// Content table
export const content = pgTable('content', {
    id: serial('id').primaryKey(),
    siteId: varchar('site_id', { length: 255 }).notNull(),
    contentTypeId: varchar('content_type_id', { length: 255 }).notNull(),
    contentId: varchar('content_id', { length: 255 }).unique().notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }),
    status: varchar('status', { length: 50 }).default('draft').notNull(),
    data: jsonb('data').notNull(), // Flexible JSON data for all content fields
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    siteContentTypeIdx: index('content_site_content_type_idx').on(table.siteId, table.contentTypeId),
    contentIdIdx: index('content_content_id_idx').on(table.contentId),
    statusIdx: index('content_status_idx').on(table.status),
}));

// Form Submissions table
export const formSubmissions = pgTable('form_submissions', {
    id: serial('id').primaryKey(),
    siteId: varchar('site_id', { length: 255 }).notNull(),
    submissionId: varchar('submission_id', { length: 255 }).unique().notNull(),
    formType: varchar('form_type', { length: 255 }).notNull(),
    data: jsonb('data').notNull(), // Flexible JSON data for form fields
    status: varchar('status', { length: 50 }).default('new').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    siteIdx: index('form_submissions_site_idx').on(table.siteId),
    submissionIdIdx: index('form_submissions_submission_id_idx').on(table.submissionId),
    statusIdx: index('form_submissions_status_idx').on(table.status),
}));

// Media table
export const media = pgTable('media', {
    id: serial('id').primaryKey(),
    siteId: varchar('site_id', { length: 255 }).notNull(),
    mediaId: varchar('media_id', { length: 255 }).unique().notNull(),
    filename: varchar('filename', { length: 500 }).notNull(),
    url: text('url').notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    size: varchar('size', { length: 100 }),
    alt: text('alt'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    siteIdx: index('media_site_idx').on(table.siteId),
    mediaIdIdx: index('media_media_id_idx').on(table.mediaId),
}));

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ContentType = typeof contentTypes.$inferSelect;
export type NewContentType = typeof contentTypes.$inferInsert;

export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type NewFormSubmission = typeof formSubmissions.$inferInsert;

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
