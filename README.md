# BlaBlaMealsDev

A web application that connects people who want to share meals together. Users can browse meal events, create their own, book reservations, and manage their profiles through an intuitive interface.

**Team:** Gerardo Obeid, Dario Gosmar, Andrea Gaudino

**Course:** EURECOM - Interaction Design and Development of Modern Web Applications

---

## Project Structure

```
BlaBlaMealsDev/
├── frontend/          # Vue.js single-page application
├── backend/           # Node.js Express API
├── setup_infra.sh     # Infrastructure setup script
├── deploy.sh          # Deployment script
└── README.md          # This file
```

## Quick Start

**Backend:**

```bash
cd backend
npm start
# Runs on http://localhost:3000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## Deployment

The application is deployed and accessible at:

- **Frontend:** [https://blablamealswebstorage.z28.web.core.windows.net](https://blablamealswebstorage.z28.web.core.windows.net)
- **Backend:** [https://blablameals-api.azurewebsites.net](https://blablameals-api.azurewebsites.net)

## Documentation

- **[Frontend Documentation](./frontend/README.md)** - Vue.js UI, components, and features
- **[Backend Documentation](./backend/README.md)** - Express.js API, routes, and database structure
