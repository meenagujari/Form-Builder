import { type User, type InsertUser, type Form, type InsertForm, type Response, type InsertResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getForm(id: string): Promise<Form | undefined>;
  getFormByShareUrl(shareUrl: string): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: string, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: string): Promise<boolean>;
  listForms(): Promise<Form[]>;
  
  createResponse(response: InsertResponse): Promise<Response>;
  getFormResponses(formId: string): Promise<Response[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private forms: Map<string, Form>;
  private responses: Map<string, Response>;

  constructor() {
    this.users = new Map();
    this.forms = new Map();
    this.responses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getForm(id: string): Promise<Form | undefined> {
    return this.forms.get(id);
  }

  async getFormByShareUrl(shareUrl: string): Promise<Form | undefined> {
    return Array.from(this.forms.values()).find(
      (form) => form.shareUrl === shareUrl,
    );
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    const id = randomUUID();
    const now = new Date();
    const shareUrl = insertForm.isPublished ? randomUUID() : null;
    const form: Form = { 
      ...insertForm, 
      id, 
      shareUrl,
      description: insertForm.description ?? null,
      headerImage: insertForm.headerImage ?? null,
      questions: insertForm.questions ?? [],
      isPublished: insertForm.isPublished ?? false,
      createdAt: now,
      updatedAt: now 
    };
    this.forms.set(id, form);
    return form;
  }

  async updateForm(id: string, updateData: Partial<InsertForm>): Promise<Form | undefined> {
    const existingForm = this.forms.get(id);
    if (!existingForm) return undefined;

    const updatedForm: Form = {
      ...existingForm,
      ...updateData,
      updatedAt: new Date(),
      shareUrl: updateData.isPublished ? (existingForm.shareUrl || randomUUID()) : existingForm.shareUrl,
    };
    
    this.forms.set(id, updatedForm);
    return updatedForm;
  }

  async deleteForm(id: string): Promise<boolean> {
    return this.forms.delete(id);
  }

  async listForms(): Promise<Form[]> {
    return Array.from(this.forms.values());
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const response: Response = {
      ...insertResponse,
      userEmail: insertResponse.userEmail ?? null,
      id,
      submittedAt: new Date(),
    };
    this.responses.set(id, response);
    return response;
  }

  async getFormResponses(formId: string): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.formId === formId,
    );
  }
}

export const storage = new MemStorage();
