# BlaBlaMealsDev

This repository contains the code for the BlaBlaMealsDev project, which is a web application designed to connect people who want to share meals together. The project is divided into two main parts: the frontend and the backend.

---

## Quick Start
To start the backend it is necessary to run the following script:

```bash
cd backend
npm start
# Backend on http://localhost:3000
```

---

## Backend

The backend is built using **Node.js and Express.js** (configured for ES modules). The entry point is `server.js`, which is responsible for setting up the core application, enabling CORS for frontend communication, and parsing incoming JSON requests. 

To keep the application modular and maintainable, the routing is broken down into separate files located in the `routes/` directory. These route files handle specific core domains: authentication (`/api/auth`), users (`/api/users`), meals (`/api/meals`), events (`/api/events`), and bookings (`/api/bookings`). At the end of the request pipeline, centralized error-handling middlewares ensure that unhandled routes (404) and internal server errors (500) are caught gracefully before the server starts on port 3000.

---

**Team:** Gerardo Obeid, Dario Gosmar, Andrea Gaudino  
**Course:** EURECOM S8 Web Integration
