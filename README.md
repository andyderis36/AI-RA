# 🚀 AIRA (AI Resume Analyzer)

![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**AIRA** is an intelligent, ATS-friendly resume analysis platform. By leveraging the multimodal capabilities of **Google Gemini 2.5 Flash**, it provides real-time, constructive feedback on resumes to help candidates perfectly match their dream Job Descriptions.

🌍 **Live Demo:** [https://ai-ra.vercel.app](https://ai-ra.vercel.app)

---

## ✨ Features

- **🧠 Contextual AI Analysis:** Upload your resume (PDF, DOCX, Image) alongside a Target Job Description. The AI will calculate an ATS match score, extract missing keywords, and suggest actionable improvements.
- **⚡ Real-time Streaming Response:** Built with Vercel AI SDK and Next.js Server Actions, the AI feedback is progressively streamed to the client for an ultra-fast user experience.
- **🎨 Premium Glassmorphism UI:** Features a highly aesthetic design system using Tailwind v4 `oklch` dynamic color palettes and micro-animations.
- **🔒 Secure Authentication:** Handled seamlessly via Clerk Auth (Email verification & Protected Routes).
- **☁️ Cloud Storage & Database:** Stores physical files in Vercel Blob and analysis records in MongoDB Atlas. Includes Webhook-based automatic cleanup to prevent orphaned files and bloated storage costs.
- **📄 PDF Export:** Easily save your analysis report pixel-perfectly via native OS vector printing capability.

---

## 🏗️ Architecture & Tech Stack

This project is built using a **Serverless Monolith** architecture optimized for edge networks.

- **Framework:** Next.js 16.2.4 (App Router) + Turbopack
- **UI Library:** React 19.2.4
- **Styling:** Tailwind CSS v4 (Custom OKLCH theme)
- **AI Backend:** Google Gemini 2.5 Flash via `@ai-sdk/google`
- **Database:** MongoDB (Mongoose ORM with Singleton pattern)
- **Authentication:** Clerk
- **Blob Storage:** Vercel Blob
- **Validation:** Zod (Strict TypeScript End-to-End type safety)

---

## 📂 Folder Structure

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, API, Actions)
│   ├── (auth)/           # Authentication routes (Sign-in/Sign-up)
│   ├── (dashboard)/      # Protected dashboard routes
│   ├── actions/          # Server Actions (Business logic, AI calls, DB writes)
│   └── api/              # API Route handlers (Webhooks, etc.)
├── components/           # React Components
│   ├── providers/        # Context Providers (QueryClient, Auth, etc.)
│   ├── resume/           # Feature-specific components (Uploader, Results)
│   └── ui/               # Reusable UI primitives (Buttons, Inputs)
├── hooks/                # Custom React Hooks
├── lib/                  # Shared utilities and SDK initializations (AI, DB)
├── models/               # Mongoose schemas and models (User, Resume)
├── types/                # Shared TypeScript interfaces and Zod schemas
└── middleware.ts         # Clerk & Edge middleware
```

---

## 🛠️ Local Development Setup

To run this project locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AI-RA-Project.git
cd AI-RA-Project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB
MONGODB_URI=mongodb+srv://...

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛡️ Security Hardening

- **Prompt Injection Defense:** Strict XML-style delimiters (`<JOB_DESCRIPTION_BLOCK>`) to protect the core AI System Prompt from malicious user input.
- **Data Integrity:** Clerk SVIX webhooks listen to `user.created`, `user.updated`, and `user.deleted` events. Deleting a user automatically cascades the deletion of Mongoose documents and physically purges PDF/Images from Vercel Blob buckets.
- **Zod Boundaries:** Upload limits (5MB Max) are validated strictly via schemas mapped natively inside Server Actions.

---
