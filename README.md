# LyraX - AI Powered Resume Optimization

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Spline](https://img.shields.io/badge/Spline-FF6B6B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==)

## Overview

LyraX is a comprehensive web application designed to help job seekers optimize their resumes for specific job applications using AI technology. The platform streamlines the entire job application process by providing intelligent resume analysis, ATS optimization, and centralized application tracking.

## Key Features

### 🤖 AI Powered Resume Enhancement

- **Intelligent Analysis**: Leverages OpenAI's API to analyze resumes and provide detailed feedback on clarity, organization, and ATS optimization
- **Job Specific Tailoring**: Automatically rewrites resumes to align with specific job descriptions while maintaining the candidate's unique voice
- **Real-time Feedback**: Provides instant analysis with actionable improvement suggestions

### 📊 Comprehensive Application Management

- **Centralized Dashboard**: Track all job applications, companies, and resume versions in one intuitive interface
- **Application Status Tracking**: Monitor application progress through various stages (pending, interviews, offers, etc.)
- **Interview & Contact Management**: Store interview dates, outcomes, and recruiter contact information

### 📄 Document Management

- **PDF Processing**: Utilizes pdf-parse library for accurate text extraction from resume PDFs
- **Secure Storage**: Encrypted document storage via Supabase with version control for both original and enhanced resumes
- **Easy Downloads**: Export AI optimized resumes as PDFs with a single click

### 🔐 Authentication & Security

- **Multiple Auth Options**: Supports email/password and OAuth 2.0 providers (Google, GitHub, LinkedIn, Microsoft, Apple, Twitter/X, Meta)
- **Secure Sessions**: Built on Supabase Auth for enterprise grade security
- **User Privacy**: All data is encrypted and user specific

### 🎨 Modern User Interface

- **Responsive Design**: Built with React, TypeScript, and Tailwind CSS for a seamless experience across devices
- **Interactive Elements**: Features dynamic Spline 3D backgrounds and smooth animations
- **Weather Integration**: Includes a weather widget for a personalized dashboard experience
- **Quick Access**: Direct links to major job boards and skill building platforms

## Technology Stack

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Spline](https://img.shields.io/badge/Spline-FF6B6B?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==)

- **Framework**: React 18 with Vite
- **Language**: TypeScript for type safety and better developer experience
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **3D Graphics**: Spline for interactive backgrounds
- **State Management**: React hooks and context

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API endpoints
- **AI Integration**: OpenAI API for resume analysis and optimization
- **File Processing**: Multer for file uploads, pdf-parse for PDF text extraction

### Database & Storage

![Supabase](https://img.shields.io/badge/Supabase-181818?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)

- **Database**: PostgreSQL via Supabase
- **File Storage**: Supabase Storage for secure document management
- **Authentication**: Supabase Auth with multiple OAuth providers

### External APIs

- **Weather**: Tomorrow.io API for real-time weather data
- **AI Processing**: OpenAI GPT models for resume analysis

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key
- Tomorrow.io API key (for weather feature)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lyrax.git
cd lyrax
```

2. Install dependencies for both client and server:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:

Create `.env` file in the server directory:

```env
# Server
PORT=3000
BASE_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Weather API
TOMORROW_IO_API_KEY=your_tomorrow_io_api_key
```

Create `.env` file in the client directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Server
VITE_SERVER_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

4. Set up Supabase database:

   - Create the required tables (users, resumes, companies, jobs, applications, interviews, contacts)
   - Set up storage buckets for resume files
   - Configure authentication providers

5. Start the development servers:

```bash
# Start the backend server (from server directory)
npm run dev

# Start the frontend (from client directory)
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Sign Up/Login**: Create an account using email or OAuth providers
2. **Upload Resume**: Upload your base resume as a PDF
3. **Add Application**: Click "NEW" to add a job application with:
   - Company information
   - Job position and location
   - Job description
   - Your resume selection
4. **AI Analysis**: The system will analyze your resume and create an optimized version
5. **Track Progress**: Update application status, add interview notes, and manage contacts
6. **Download**: Export your AI-optimized resume as a PDF

## Project Structure

```
lyrax/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── assets/        # Images and icons
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── utils/         # Helper functions
│   │   └── config/        # Server configuration
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/resumes/upload` - Upload and analyze resume
- `POST /api/resumes/improve` - Generate job-specific resume
- `GET /api/resumes` - Fetch user's resumes
- `POST /api/applications/create` - Create new application
- `POST /api/companies/create` - Add new company
- `GET /api/companies` - Fetch user's companies
- `POST /api/jobs/create` - Create job posting
- `GET /api/weather` - Fetch weather data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
