# Backend Documentation

The backend is a Node.js Express.js API server that handles business logic, authentication, user management, meal and event operations, and bookings. It uses ES modules and provides RESTful endpoints for the frontend application.

## Features

- **RESTful API** - Clean endpoints for all core operations
- **Authentication** - JWT-based user authentication and authorization
- **Database Integration** - Comprehensive data persistence
- **Error Handling** - Centralized middleware for error management
- **CORS Support** - Enabled for frontend communication
- **Modular Architecture** - Separated routes for maintainability

## Backend Structure

```
backend/
├── node_modules/          # Project dependencies
├── db/                    # Database configuration
│   └── db.js             # Database connection and setup
├── routes/                # Modular Express routers
│   ├── auth.js           # Signup, login, token generation
│   ├── users.js          # User profiles and management
│   ├── meals.js          # Meal endpoints
│   ├── events.js         # Event creation and management
│   └── bookings.js       # Event booking operations
├── middleware.js          # Express middleware (CORS, JSON parsing, error handling)
├── server.js             # Main application entry point
├── package.json          # Dependencies and scripts
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /signup` - Register a new user
- `POST /login` - Authenticate user

### Users (`/api/users`)

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /dashboard` - Get user dashboard data

### Meals (`/api/meals`)

- `GET /` - List all meals
- `GET /:id` - Get meal details
- `POST /` - Create a new meal

### Events (`/api/events`)

- `GET /` - List all events
- `GET /:id` - Get event details
- `POST /` - Create a new event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event

### Bookings (`/api/bookings`)

- `GET /` - List user bookings
- `POST /` - Create a new booking
- `DELETE /:id` - Cancel a booking

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Server runs on `http://localhost:3000`

## Database

The application uses a configured database for storing:

- User accounts and authentication data
- Meal information and categories
- Event listings and details
- Booking reservations
- User preferences and profiles
- User notifications and alerts

Database initialization occurs automatically on server startup.

## Environments

### Development Environment

- Backend runs on: `http://localhost:3000`
- Database: Local development database
- Used for local testing and development

### Production Environment

- Backend runs on: Azure deployed backend
- Database: Azure hosted database
- Frontend accesses the API through the Azure deployment endpoint
- When the frontend is deployed to Azure, it automatically connects to the production backend API

## Deployment

The backend API is deployed and accessible at:
**[https://blablameals-api.azurewebsites.net](https://blablameals-api.azurewebsites.net)**
