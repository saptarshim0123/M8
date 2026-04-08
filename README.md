# equil — Smart Tourism & Mental Health AI Platform

equil is a sophisticated MERN stack application designed to provide AI-driven mental health support through secure journaling, real-time therapy connections, and advanced sentiment analysis.

## 🚀 Key Features

### 1. User Authentication System
*   User registration and login
*   Google OAuth 2.0 integration (Passport.js)
*   JWT-based authentication
*   Protected routes for authorized access

### 2. Email OTP Verification
*   OTP generation and sending using Nodemailer
*   Email-based 2FA verification for user registration and password recovery
*   Prevents fake or unauthorized accounts

### 3. Cloud File Upload System
*   File uploading implemented using Multer and `multer-storage-cloudinary`
*   Images and PDFs stored remotely via Cloudinary integration
*   Supports dynamic user avatar image uploads
*   Supports therapist credential and document uploads (PDF/Images) for verification

### 4. Secure Journal Management (CRUD)
*   Create new journal entries with Rich Text formatting (TipTap)
*   Read/view all personal entries
*   AES-based data encryption for sensitive text storage (`encryptService`)
*   Delete functionality for journals 

### 5. AI Journal Analysis & Insights
*   Integrated with Google Gemini AI API
*   Sentiment and mood analysis on journal entries
*   Detects cognitive distortions and provides customized coping suggestions
*   Crisis and self-harm detection mechanisms 

### 6. AI Mental Health Assistant & Chatbot
*   Separate AI chat environment for general support
*   Provides context-aware mental wellness tips 
*   Powered dynamically by Gemini AI conversations

### 7. Real-Time Therapy Chat System
*   Implemented using Socket.IO
*   Enables direct real-time communication between patients and paired therapists
*   Secure communication rooms tied to connection requests

### 8. Therapist Role System & Dashboard
*   Therapist verification and onboarding (using Cloudinary document uploads)
*   Therapist Dashboard to manage approved patient connections
*   Securely view specific patient journals (conditional based on user sharing settings)
*   Professional connection system using unique `practiceCode` generation

### 9. Admin Role System & Dashboard
*   Role-based access control (Admin, Therapist, User)
*   Admin dashboard for overseeing user activity and system metrics
*   Ability to manage, verify, or decline registered therapists

### 10. Gamification & User Profiling
*   Journal writing streaks and longest streak tracking
*   Dynamic avatar generation integration (`boring-avatars`)
*   Weekly digest and personalized user insights mapping

### 11. Security & Privacy Features
*   AES encryption/decryption for journal contents ensuring HIPAA-style privacy
*   Password hashing using bcrypt
*   JWT authentication for secure sessions
*   Role-based backend middleware (Admin, Therapist, and standard User routing)

### 12. User Interface and Experience
*   Built using React (Vite environment)
*   Tailwind CSS integrated with DaisyUI for components and layouts
*   Responsive layout with distinct features for varying user roles
*   Dark/Light theme context management (`ThemeContext`)

### 13. Version Control and Project Management
*   Git used for version control
*   Organized folder structure (frontend/backend separation)

---

## 🛠️ System Architecture

*   **Frontend:** React (Vite) + Tailwind CSS + DaisyUI
*   **Backend:** Node.js + Express.js
*   **Database:** MongoDB (Mongoose)
*   **Cloud Storage:** Cloudinary 
*   **External Integrations:**
    *   Google Gemini AI API (AI features & analysis)
    *   Socket.IO (real-time chat system)
    *   Passport.js (Google OAuth)
    *   Nodemailer (OTP & Email handling)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js installed
- MongoDB URI
- Cloudinary Credentials
- Google Gemini API Key
- Google OAuth Credentials

### Installation
1. Clone the repository
2. Install dependencies for both `client` and `server` folders.
3. Set up your `.env` files in both directories.
4. Run `npm run dev` in both directories.
