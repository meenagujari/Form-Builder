# Overview

This is a modern full-stack form builder application that allows users to create interactive forms with three specialized question types: categorization, cloze (fill-in-the-blank), and reading comprehension. The application features a split-screen interface with a form builder on one side and real-time preview on the other, along with a separate form-filling interface for respondents.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with routes for form building (`/builder/:id`), form filling (`/fill/:shareUrl`), and 404 handling
- **State Management**: React Query (@tanstack/react-query) for server state management with optimistic updates and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library providing accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Drag & Drop**: @dnd-kit for sortable interactions in categorization questions and form elements
- **File Upload**: Uppy dashboard integration for image uploads with AWS S3 support

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful API with endpoints for forms CRUD operations, file uploads, and form responses
- **Database ORM**: Drizzle ORM with PostgreSQL as the database dialect
- **Storage**: In-memory storage implementation with interface for easy swapping to database persistence
- **File Storage**: Google Cloud Storage integration with object ACL (Access Control List) system for file permissions
- **Development**: Hot module replacement via Vite middleware in development mode

## Data Storage Solutions
- **Database**: MongoDB Atlas with Mongoose ODM for flexible document storage and automatic fallback to in-memory storage
- **Schema Design**: 
  - Forms collection with nested question arrays for flexible storage
  - Responses collection linking to forms with JSON answers
  - UUID primary keys with automatic generation
  - Embedded question schemas supporting all three question types
- **Connection Handling**: Graceful fallback from MongoDB Atlas to in-memory storage when connection fails
- **Caching**: React Query provides client-side caching with stale-while-revalidate patterns

## Authentication and Authorization
- **Object-Level Security**: Custom ACL system for file access control with user groups and permissions
- **File Access**: Replit sidecar integration for secure Google Cloud Storage access
- **API Security**: Express middleware for request logging and error handling

# External Dependencies

## Cloud Services
- **MongoDB Atlas**: Primary database solution with connection string integration and fallback to in-memory storage
- **Google Cloud Storage**: File storage solution with automatic credential management via Replit sidecar (configured but not actively used)
- **Mongoose ODM**: MongoDB object document mapper for type-safe database operations

## UI and Design Libraries
- **Radix UI**: Complete suite of accessible UI primitives (accordion, dialog, dropdown, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Inter Font**: Google Fonts integration for typography

## Development and Build Tools
- **Vite**: Fast build tool with HMR support and Replit integration plugins
- **TypeScript**: Type safety across frontend, backend, and shared schemas
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Fast JavaScript bundler for production builds

## File Upload and Management
- **Uppy**: Modular file upload library with dashboard UI and AWS S3 support
- **@uppy/aws-s3**: Direct-to-S3 upload capability with presigned URLs

## Form and Data Handling
- **React Hook Form**: Forms with validation using @hookform/resolvers
- **Zod**: Schema validation library integrated with Drizzle for type-safe data validation
- **@dnd-kit**: Accessibility-focused drag and drop library for interactive question types

## Development Experience
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling