# Interactive Form Builder

A dynamic and interactive MERN stack form builder that enables users to create complex, engaging surveys with advanced interaction modes. This project features three specialized question types: categorization, cloze (fill-in-the-blank), and reading comprehension.

## 🚀 Features

### Question Types
- **Categorize**: Drag & drop items into categories with visual feedback
- **Cloze Test**: Fill-in-the-blank questions with draggable answer options
- **Comprehension**: Reading passages with multiple-choice questions

### Form Management
- **Visual Form Builder**: Split-screen interface with real-time preview
- **Image Support**: Upload header images and question images
- **Anonymous Responses**: Collect responses without requiring user accounts
- **Share Links**: Generate unique URLs for form distribution
- **Response Tracking**: Store and manage form submissions

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Preview**: See form changes instantly while building
- **Professional UI**: Clean, modern interface with Tailwind CSS
- **Interactive Elements**: Drag-and-drop functionality for engaging user experience

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **@dnd-kit** for drag-and-drop functionality
- **React Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB Atlas** with Mongoose ODM
- **Multer** for file uploads
- **Drizzle ORM** for database operations

### Development Tools
- **ESBuild** for fast bundling
- **Hot Module Replacement** for instant updates
- **TypeScript** across the entire stack

## 📋 Prerequisites

- Node.js (version 18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Modern web browser

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd form-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   
   # Optional: For object storage (if using external file storage)
   PUBLIC_OBJECT_SEARCH_PATHS=/form-builder-bucket/public
   PRIVATE_OBJECT_DIR=/form-builder-bucket/private
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared TypeScript schemas
│   └── schema.ts           # Data models and validation
├── uploads/                # Local file storage (auto-created)
└── package.json            # Project dependencies
```

## 🎯 Usage

### Creating a Form

1. **Start Building**: Click "New Form" to create a form
2. **Add Header**: Upload a header image and set title/description
3. **Add Questions**: Choose from three question types:
   - **Categorize**: Create categories and items to be sorted
   - **Cloze**: Write text with blanks and provide answer options
   - **Comprehension**: Add reading passage with multiple-choice questions
4. **Preview**: Use the split-screen preview to test your form
5. **Save & Share**: Generate a share link for distribution

### Form Types Explained

#### Categorize Questions
- Create multiple categories (destinations)
- Add items that need to be categorized
- Users drag items into correct categories
- Perfect for sorting exercises and classification tasks

#### Cloze Questions
- Write sentences with underscores for blanks
- Provide answer options as draggable chips
- Users drag answers to fill in blanks
- Great for language learning and comprehension tests

#### Comprehension Questions
- Add a reading passage
- Create multiple-choice questions about the passage
- Support for images within questions
- Ideal for reading comprehension assessments

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Database Schema

The application uses MongoDB with the following collections:

- **Forms**: Store form metadata, questions, and configuration
- **Responses**: Store user submissions with answers
- **Files**: Handle uploaded images and media

### API Endpoints

```
GET    /api/forms/:id          # Get form by ID
POST   /api/forms              # Create new form
PUT    /api/forms/:id          # Update form
GET    /api/share/:shareUrl    # Get form by share URL
POST   /api/forms/:id/responses # Submit form response
POST   /api/upload             # Upload images
```

## 🚀 Deployment

### Local Development
The application is configured to run locally with:
- Frontend and backend on the same port (5000)
- Automatic MongoDB connection with fallback
- Local file storage for uploads

### Production Deployment
For production deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   MONGODB_URI=your_production_mongodb_uri
   NODE_ENV=production
   ```

3. **Configure file storage**
   - Set up cloud storage (AWS S3, Google Cloud Storage)
   - Update environment variables for object storage

### Replit Deployment
This project is optimized for Replit:
- Automatic dependency installation
- Built-in MongoDB Atlas integration
- Object storage support
- One-click deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Verify your MongoDB URI in the `.env` file
- Check network connectivity
- The app will fall back to in-memory storage if MongoDB is unavailable

**File Upload Issues**
- Ensure the `/uploads` directory has write permissions
- Check file size limits (default: 5MB)
- Verify image format support (JPEG, PNG, GIF, WebP)

**Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires v18+)
- Clear node_modules and reinstall if needed

### Getting Help

- Check the console for error messages
- Review the browser developer tools
- Ensure all environment variables are set correctly

## 🔮 Future Enhancements

- User authentication and form ownership
- Advanced analytics and reporting
- Custom question types
- Form templates and themes
- Collaboration features
- API integrations
- Export functionality (PDF, Excel)

---

Built with ❤️ for creating engaging, interactive forms and surveys.