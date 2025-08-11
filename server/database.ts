import mongoose from 'mongoose';
import { Form, Response, Question } from '@shared/schema';

const MONGODB_URI = "mongodb+srv://meenagujari88:o9eVMlP6b4qayJ0S@formforge-db.qguk7a3.mongodb.net/?retryWrites=true&w=majority&appName=FormForge-db";

// MongoDB Schemas
const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['categorize', 'cloze', 'comprehension'], required: true },
  // Categorize fields
  question: String,
  items: [{
    id: String,
    text: String,
    correctCategory: String
  }],
  categories: [{
    id: String,
    name: String
  }],
  // Cloze fields
  text: String,
  blanks: [{
    id: String,
    word: String,
    position: Number
  }],
  // Comprehension fields
  passage: String,
  questions: [{
    id: String,
    question: String,
    options: [{
      id: String,
      text: String,
      isCorrect: Boolean
    }]
  }],
  // Common field
  image: String
}, { _id: false });

const FormSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: null },
  headerImage: { type: String, default: null },
  questions: [QuestionSchema],
  isPublished: { type: Boolean, default: false },
  shareUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ResponseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  formId: { type: String, required: true },
  answers: { type: mongoose.Schema.Types.Mixed, required: true },
  userEmail: { type: String, default: null },
  submittedAt: { type: Date, default: Date.now }
});

export const FormModel = mongoose.model('Form', FormSchema);
export const ResponseModel = mongoose.model('Response', ResponseSchema);

export async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
}