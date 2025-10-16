# JEE-NEET Preparation App

An AI-powered JEE and NEET preparation platform built with Next.js, Supabase, and OpenAI integration. This application provides a comprehensive admin dashboard for managing educational content and AI-generated questions.

## 🚨 FIXED: Admin Login Issue

The admin login page is now accessible at: **http://localhost:3001/admin/login**

### Quick Test:
1. Visit http://localhost:3001/admin/login
2. Click "Use Demo Credentials" 
3. Use: admin@example.com / admin123
4. Make sure you've created this user in Supabase first!

## 🚀 Features

### Core Features
- **Authentication System**: Secure login/logout with Supabase Auth
- **Folder Management**: Create, edit, delete folders with custom colors
- **Nested Navigation**: Hierarchical folder structure with breadcrumbs
- **Context Menus**: Right-click functionality throughout the interface

### Advanced File Management
- **Supabase Storage Integration**: Secure file storage with proper access controls
- **Google Drive API Integration**: Download files directly from Google Drive
- **File Preview System**: Preview PDFs, images, videos, audio files, and documents
- **Batch Upload Support**: Upload multiple files with individual progress tracking
- **File Operations**: Download, delete, and organize files within folders

### Technical Highlights
- **Next.js 15**: Latest version with App Router for modern React development
- **Supabase**: Complete backend solution (database, auth, storage)
- **Shadcn UI**: Professional component library with beautiful design
- **TypeScript**: Full type safety throughout the application
- **Real-time Updates**: Live progress tracking and notifications
- **Responsive Design**: Works seamlessly on desktop and mobile

### Advanced Features
- **Batch Upload System**: Queue management with pause/resume functionality
- **Google Drive Integration**: OAuth authentication and file browsing
- **File Preview System**: Multi-format support with modal interface
- **Storage Management**: User-based organization with secure access

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Framework**: Shadcn UI + Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI API (planned)
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd jee-neet
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the project settings
3. In the Supabase SQL Editor, run the following schema:

```sql
-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    category VARCHAR(10) CHECK (category IN ('jee', 'neet')) NOT NULL,
    class_type VARCHAR(10) CHECK (class_type IN ('11th', '12th', 'dropper')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create questions table (for future use)
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    solution TEXT,
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
    category VARCHAR(10) CHECK (category IN ('jee', 'neet')) NOT NULL,
    class_type VARCHAR(10) CHECK (class_type IN ('11th', '12th', 'dropper')) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    pdf_url TEXT,
    drive_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies (see schema.sql for complete policies)
```

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration (for future use)
OPENAI_API_KEY=your_openai_api_key
```

### 5. Create Admin User

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Create a new user with email and password
4. This user will be able to access the admin dashboard

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Admin Access
1. Navigate to `/admin/login`
2. Log in with your Supabase admin credentials
3. Access the dashboard at `/admin/dashboard`

### Dashboard Features
- Switch between JEE and NEET sections
- Navigate through Class 11th, 12th, and Dropper categories
- Create new folders with optional parent folder selection
- Edit existing folder names
- Delete folders (with confirmation)
- View hierarchical folder structure

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Admin dashboard
│   │   └── login/
│   │       └── page.tsx         # Admin login page
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts         # Auth callback handler
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   └── ui/                      # Shadcn UI components
├── lib/
│   ├── supabase.ts             # Supabase client configuration
│   └── utils.ts                # Utility functions
└── middleware.ts               # Route protection middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Next Steps

The current implementation provides a solid foundation. Here are the planned next features:

1. **Question Management**: Add functionality to upload and manage questions
2. **PDF Upload**: Implement PDF parsing and storage
3. **Google Drive Integration**: Connect with Google Drive API
4. **OpenAI Integration**: Add AI question generation
5. **Student Interface**: Create student-facing question practice interface
6. **Analytics**: Add progress tracking and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
