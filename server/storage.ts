import { type User, type InsertUser, type Form, type InsertForm, type Response, type InsertResponse } from "@shared/schema";
import { randomUUID } from "crypto";
import { FormModel, ResponseModel } from "./database";

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

export class MongoStorage implements IStorage {
  private users: Map<string, User> = new Map();

  // User methods (keeping in-memory for simplicity)
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

  // MongoDB Form methods
  async getForm(id: string): Promise<Form | undefined> {
    try {
      const form = await FormModel.findOne({ id }).lean();
      return form ? this.transformForm(form) : undefined;
    } catch (error) {
      console.error('Error getting form:', error);
      return undefined;
    }
  }

  async getFormByShareUrl(shareUrl: string): Promise<Form | undefined> {
    try {
      const form = await FormModel.findOne({ shareUrl }).lean();
      return form ? this.transformForm(form) : undefined;
    } catch (error) {
      console.error('Error getting form by share URL:', error);
      return undefined;
    }
  }

  async createForm(insertForm: InsertForm): Promise<Form> {
    try {
      const id = randomUUID();
      const now = new Date();
      const shareUrl = insertForm.isPublished ? randomUUID() : null;
      
      const formData = {
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

      const form = new FormModel(formData);
      await form.save();
      
      return this.transformForm(form.toObject());
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  }

  async updateForm(id: string, updateData: Partial<InsertForm>): Promise<Form | undefined> {
    try {
      const existingForm = await FormModel.findOne({ id }).lean();
      if (!existingForm) return undefined;

      const updatedData = {
        ...updateData,
        updatedAt: new Date(),
        shareUrl: updateData.isPublished ? (existingForm.shareUrl || randomUUID()) : existingForm.shareUrl,
      };

      const updatedForm = await FormModel.findOneAndUpdate(
        { id },
        updatedData,
        { new: true }
      ).lean();
      
      return updatedForm ? this.transformForm(updatedForm) : undefined;
    } catch (error) {
      console.error('Error updating form:', error);
      return undefined;
    }
  }

  async deleteForm(id: string): Promise<boolean> {
    try {
      const result = await FormModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting form:', error);
      return false;
    }
  }

  async listForms(): Promise<Form[]> {
    try {
      const forms = await FormModel.find().lean();
      return forms.map(form => this.transformForm(form));
    } catch (error) {
      console.error('Error listing forms:', error);
      return [];
    }
  }

  // MongoDB Response methods
  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    try {
      const id = randomUUID();
      const responseData = {
        ...insertResponse,
        userEmail: insertResponse.userEmail ?? null,
        id,
        submittedAt: new Date(),
      };

      const response = new ResponseModel(responseData);
      await response.save();
      
      return this.transformResponse(response.toObject());
    } catch (error) {
      console.error('Error creating response:', error);
      throw error;
    }
  }

  async getFormResponses(formId: string): Promise<Response[]> {
    try {
      const responses = await ResponseModel.find({ formId }).lean();
      return responses.map(response => this.transformResponse(response));
    } catch (error) {
      console.error('Error getting form responses:', error);
      return [];
    }
  }

  private transformForm(mongoForm: any): Form {
    return {
      id: mongoForm.id,
      title: mongoForm.title,
      description: mongoForm.description,
      headerImage: mongoForm.headerImage,
      questions: mongoForm.questions || [],
      isPublished: mongoForm.isPublished,
      shareUrl: mongoForm.shareUrl,
      createdAt: mongoForm.createdAt,
      updatedAt: mongoForm.updatedAt
    };
  }

  private transformResponse(mongoResponse: any): Response {
    return {
      id: mongoResponse.id,
      formId: mongoResponse.formId,
      answers: mongoResponse.answers,
      userEmail: mongoResponse.userEmail,
      submittedAt: mongoResponse.submittedAt
    };
  }
}

// Use MongoDB if available, fallback to memory storage
let storageInstance: IStorage;

try {
  // Try MongoDB first
  storageInstance = new MongoStorage();
} catch (error) {
  console.log("MongoDB not available, using in-memory storage");
  
  // Fallback MemStorage class
  class MemStorage implements IStorage {
    private users: Map<string, User> = new Map();
    private forms: Map<string, Form> = new Map();
    private responses: Map<string, Response> = new Map();

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
  
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
