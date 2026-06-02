# Frontend Documentation

The frontend is a responsive Vue.js single-page application that provides a user interface for discovering and managing meal events. It communicates with the backend API to fetch meal data, handle user authentication, and manage bookings.

## Features

- **User Authentication** - Login/signup with JWT token management
- **Meal Discovery** - Browse and search available meal events
- **Event Management** - Create, view, and manage meal events
- **Bookings** - Reserve spots at meal events
- **User Profiles** - Manage personal information and preferences
- **Responsive Design** - Optimized for desktop and mobile devices
- **W3C Compliant** - Valid HTML and accessibility standards
- **Accessibility** - WCAG 2.1 compliant with proper ARIA labels

## Project Structure

```
src/
├── components/              # Vue.js components
│   ├── App.vue             # Root component
│   ├── Navbar.vue          # Navigation bar
│   ├── Footer.vue          # Footer component
│   ├── LandingPage.vue     # Landing page
│   ├── HomePage.vue        # Main dashboard
│   ├── LoginPage.vue       # Authentication
│   ├── ProfilePage.vue     # User profile
│   ├── BookingsPage.vue    # User bookings
│   ├── SearchResultsPage.vue # Search results
│   ├── DashboardPage.vue   # User dashboard
│   ├── CreateMealEventModal.vue # Event creation
│   └── ToastNotification.vue    # Notifications
├── services/               # API communication
│   ├── api.js             # Axios API client
│   └── authService.js     # Authentication service
├── session/               # State management
│   └── authStore.js       # Auth state store
├── router/                # Routing
│   └── index.js           # Route definitions
├── utils/                 # Helpers & constants
│   ├── constants.js       # App constants
│   ├── helpers.js         # Utility functions
│   └── toast.js           # Toast notifications
├── assets/                # CSS & images
└── main.js                # Application entry point
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser at `http://localhost:5173`

## Backend Integration

### Development Environment

The frontend connects to the backend API at `http://localhost:3000` for:

- User authentication (`/api/auth`)
- Meal listings (`/api/meals`)
- Event management (`/api/events`)
- Bookings (`/api/bookings`)
- User profiles (`/api/users`)

### Production Environment

When deployed, the frontend accesses the backend API through the Azure-deployed backend instance, maintaining the same API contract.

## Environments

### Local Development

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Used for local development and testing

### Production

- Frontend: `https://blablamealswebstorage.z28.web.core.windows.net`
- Backend API: Azure deployed backend `https://blablameals-api.azurewebsites.net`
- When deployed, the frontend automatically connects to the Azure-hosted backend API

## Deployment

The frontend is deployed and accessible at:
**[https://blablamealswebstorage.z28.web.core.windows.net](https://blablamealswebstorage.z28.web.core.windows.net)**
