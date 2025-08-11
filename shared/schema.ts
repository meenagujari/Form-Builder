import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const forms = pgTable("forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  headerImage: text("header_image"),
  questions: jsonb("questions").notNull().default('[]'),
  isPublished: boolean("is_published").notNull().default(false),
  shareUrl: varchar("share_url").unique(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  submittedAt: timestamp("submitted_at").notNull().default(sql`now()`),
});

// Question type schemas
export const categorizeQuestionSchema = z.object({
  type: z.literal("categorize"),
  id: z.string(),
  question: z.string(),
  image: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    text: z.string(),
    correctCategory: z.string(),
  })),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
});

export const clozeQuestionSchema = z.object({
  type: z.literal("cloze"),
  id: z.string(),
  text: z.string(),
  image: z.string().optional(),
  blanks: z.array(z.object({
    id: z.string(),
    word: z.string(),
    position: z.number(),
  })),
});

export const comprehensionQuestionSchema = z.object({
  type: z.literal("comprehension"),
  id: z.string(),
  passage: z.string(),
  image: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      isCorrect: z.boolean(),
    })),
  })),
});

export const questionSchema = z.discriminatedUnion("type", [
  categorizeQuestionSchema,
  clozeQuestionSchema,
  comprehensionQuestionSchema,
]);

export const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  headerImage: z.string().optional(),
  questions: z.array(questionSchema),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFormSchema = createInsertSchema(forms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  shareUrl: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  submittedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
export type Question = z.infer<typeof questionSchema>;
export type CategorizeQuestion = z.infer<typeof categorizeQuestionSchema>;
export type ClozeQuestion = z.infer<typeof clozeQuestionSchema>;
export type ComprehensionQuestion = z.infer<typeof comprehensionQuestionSchema>;
