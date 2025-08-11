import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
import { insertFormSchema, insertResponseSchema, formSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));
  // Object storage routes for file uploads
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Real file upload endpoint
  app.post("/api/upload", upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ 
        success: true, 
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "File upload failed" });
    }
  });

  // Legacy object storage endpoint for compatibility
  app.post("/api/objects/upload", async (req, res) => {
    try {
      // Check if object storage is configured
      const hasObjectStorage = process.env.PUBLIC_OBJECT_SEARCH_PATHS && process.env.PRIVATE_OBJECT_DIR;
      
      if (hasObjectStorage) {
        const objectStorageService = new ObjectStorageService();
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        res.json({ uploadURL });
      } else {
        // Return an endpoint for direct file upload
        res.json({ uploadURL: "/api/upload" });
      }
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Form CRUD routes
  app.get("/api/forms", async (req, res) => {
    try {
      const forms = await storage.listForms();
      res.json(forms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ error: "Failed to fetch forms" });
    }
  });

  app.get("/api/forms/:id", async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      console.error("Error fetching form:", error);
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  // Share route for form filling mode
  app.get("/api/share/:shareUrl", async (req, res) => {
    try {
      // For simplicity, we'll use the form ID as the share URL
      const form = await storage.getForm(req.params.shareUrl);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      console.error("Error fetching shared form:", error);
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  app.post("/api/forms", async (req, res) => {
    try {
      const validatedData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(validatedData);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating form:", error);
      res.status(500).json({ error: "Failed to create form" });
    }
  });

  app.put("/api/forms/:id", async (req, res) => {
    try {
      const validatedData = insertFormSchema.partial().parse(req.body);
      const form = await storage.updateForm(req.params.id, validatedData);
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error updating form:", error);
      res.status(500).json({ error: "Failed to update form" });
    }
  });

  app.delete("/api/forms/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteForm(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Form not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting form:", error);
      res.status(500).json({ error: "Failed to delete form" });
    }
  });

  // Form sharing routes
  app.get("/api/share/:shareUrl", async (req, res) => {
    try {
      const form = await storage.getFormByShareUrl(req.params.shareUrl);
      if (!form || !form.isPublished) {
        return res.status(404).json({ error: "Form not found or not published" });
      }
      res.json(form);
    } catch (error) {
      console.error("Error fetching shared form:", error);
      res.status(500).json({ error: "Failed to fetch form" });
    }
  });

  // Response routes
  app.post("/api/forms/:id/responses", async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id);
      if (!form || !form.isPublished) {
        return res.status(404).json({ error: "Form not found or not published" });
      }

      const responseData = {
        formId: req.params.id,
        answers: req.body.answers,
      };

      const validatedData = insertResponseSchema.parse(responseData);
      const response = await storage.createResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating response:", error);
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  app.get("/api/forms/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getFormResponses(req.params.id);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
