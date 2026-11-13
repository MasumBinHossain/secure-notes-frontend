
# Secure Notes — Frontend

A React-based frontend for the Secure Notes application. It integrates with a REST API built using Express.js, MongoDB and JWT authentication.

## Live Application

**Website:** https://secure-notes-frontend-bay.vercel.app/

**Backend API:** https://secure-notes-backend-sk1i.onrender.com/

## Features

### Authentication
- User registration and login.
- JWT-based authentication.
- Registration with optional interests.

### Notes
- Create, view, update and delete personal notes.
- Notes are accessible only to their owners.

### Admin Dashboard
- View registered users.
- Create and delete users.
- Update user roles.
- View everyone's notes.
- View users grouped by interests.

### Public Posts
- Browse public posts without logging in.
- Authenticated users can publish posts.
- View all posts belonging to a specific author.
- Paginated post listing.

## Technology Stack

- React
- Vite
- JavaScript
- CSS
- Fetch API

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Requirements

- Node.js
- npm

## Installation

Clone the repository:

```bash
git clone https://github.com/MasumBinHossain/secure-notes-frontend.git
cd secure-notes-frontend
```

Install dependencies:

```bash
npm install
```

## Environment Variables (Optional)

By default, the frontend connects to the deployed Render backend.

To connect to a local backend during development, create a `.env.local` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:5000
```

## Run Locally

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173/
```

## Production Build

Build the application:

```bash
npm run build
```

The optimized production files will be generated in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

## Backend Integration

The frontend communicates with the deployed backend through `src/api.js`.

The API helper handles:
- HTTP requests.
- JSON request and response handling.
- JWT authorization headers.
- API error responses.

## Deployment

The frontend is deployed on Vercel and automatically redeploys when changes are pushed to the main GitHub branch.

**GitHub Repository:** https://github.com/MasumBinHossain/secure-notes-frontend
