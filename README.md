# Mealex 🍽️

A social networking app designed to connect Northwestern University students for dining experiences. Mealex helps students find dining partners, share meal preferences, and build connections within the university community.

## Overview

Mealex is a React-based web application that allows Northwestern students to:
- Create detailed profiles with personal information, interests, and availability
- Browse and discover other students looking for dining companions
- Send and receive connection invitations
- Manage incoming and outgoing invitation requests
- Filter profiles based on interests and preferences

The app uses Firebase for authentication and real-time data storage, ensuring secure access limited to Northwestern University email addresses (@u.northwestern.edu).

## Features

### 🔐 **Authentication**
- Google Sign-In integration
- Restricted access to Northwestern University email addresses
- Secure user authentication through Firebase Auth

### 👤 **User Profiles**
- Complete profile creation and editing
- Personal information (name, major, graduation year, bio)
- Interest tags and meal preferences
- Availability scheduling
- LinkedIn profile integration
- Profile photo from Google account

### 🤝 **Social Connections**
- Browse other student profiles
- Send connection invitations with custom messages
- Accept or decline incoming invitations
- Track invitation status (pending, accepted, rejected)
- Timestamped message history

### 🔍 **Discovery & Filtering**
- Search and filter profiles by interests
- View detailed profile pages
- Responsive grid layout for profile browsing

## Tech Stack

- **Frontend**: React 19+ with TypeScript
- **Styling**: TailwindCSS 4
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Forms**: React Hook Form with Zod validation
- **Backend**: Firebase (Authentication + Realtime Database)
- **Testing**: Vitest

## Requirements

- Node.js 22 or greater
- Northwestern University email address (@u.northwestern.edu)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eddiesg666/mealex.git
   cd mealex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_DB_URL=your_database_url
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to the URL displayed in the terminal (typically `http://localhost:5173`)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Runs the app in development mode |
| `npm run build` | Builds the app for production |
| `npm run serve` | Serves the production build |
| `npm test` | Runs the test suite |
| `npm run coverage` | Runs tests with coverage reports |

## Project Structure

```
mealex/
├── public/
│   └── robots.txt
├── src/
│   ├── components/          # React components
│   │   ├── ProfileCard.tsx
│   │   ├── UserProfile.tsx
│   │   ├── InvitationForm.tsx
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   └── ProfilesContext.tsx
│   ├── routes/             # TanStack Router routes
│   │   ├── index.tsx
│   │   ├── profile.tsx
│   │   └── ...
│   ├── types/              # TypeScript type definitions
│   │   ├── Profile.ts
│   │   └── Message.ts
│   ├── utilities/          # Utility functions
│   │   └── firebase.ts
│   └── main.tsx
├── docs/                   # Documentation
├── minutes/               # Meeting minutes
└── ...
```

## Usage

1. **Sign In**: Use your Northwestern University Google account to sign in
2. **Create/edit Profile**: Complete your profile with personal information and preferences
3. **Browse Profiles**: Explore other students' profiles using the main dashboard
4. **Connect**: Send invitations to students you'd like to dine with
5. **Manage Invitations**: Accept or decline incoming requests in your profile page
6. **Stay Connected**: Track your connections and plan dining experiences

