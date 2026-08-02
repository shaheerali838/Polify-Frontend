# Polify Frontend

Polify is a modern, responsive polling application frontend built with React, Vite, and Tailwind CSS. It allows users to create, vote on, and bookmark polls, while engaging with others through comments.

## 🚀 Features

- **User Authentication**: Secure login, registration, OTP verification, and password recovery.
- **Interactive Dashboard**: View and interact with active polls.
- **Poll Creation**: Easy-to-use interface for creating new polls with multiple options.
- **User Engagement**: Vote on polls, add comments, and bookmark favorite polls.
- **Social Networking**: 
  - Follow/unfollow users with instantaneous Optimistic UI updates.
  - View public profiles containing users' stats, bio, and created polls.
  - Mutual connection detection (e.g., "Follows you" badges).
  - Private follower/following list modals for account owners.
- **Profile Management**: Dedicated account settings page to update user profile, avatar, passwords, and security settings.
- **Real-time Notifications**: Stay updated with a built-in notification bell.
- **Responsive Design**: Fully responsive UI tailored for all screen sizes using Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **State Management**: React Context API
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Folder Structure

```
src/
├── assets/         # Static assets and predefined/dummy styles
├── components/     # Reusable UI components (Layout, UI Elements, UserBadge)
├── context/        # React Contexts for global state (Auth, Comments)
├── hooks/          # Custom React hooks (e.g., useClickoutside)
├── pages/          # Application views (Dashboard, Auth, Settings, Public Profile)
├── utils/          # Utility functions and API configuration
├── App.jsx         # Main application routing and protected routes
├── main.jsx        # React application entry point
└── index.css       # Global stylesheet including Tailwind directives
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have Node.js and npm (or yarn/pnpm) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   cd Polify-Frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Environment Variables:
   Check the `.env` file for required environment variables (e.g., API base URL). By default, the app is configured to proxy API requests to `http://localhost:5000`.

### Running the Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📜 Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the app for production into the `dist` folder.
- `npm run lint` - Runs ESLint to check for code quality and style issues.
- `npm run preview` - Boots up a local static web server that serves the files from `dist` for previewing the production build.

## 🛡️ Authentication Flow

The app uses a protected routing mechanism. Users must be authenticated to access the main application features (Dashboard, Create Poll, Profile, etc.). Unauthenticated users are automatically redirected to the `/login` page.
