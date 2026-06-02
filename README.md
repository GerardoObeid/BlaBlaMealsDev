# BlaBlaMealsDev

BlaBlaMeals is an innovative, full-stack web application designed to foster community through a shared dining economy. Inspired by the "sharing is caring" model, the platform serves as a bridge between local culinary enthusiasts and hungry guests looking for more than just a restaurant meal.

**BlaBlaMealsTeam:** Gerardo Obeid, Dario Gosmar, Andrea Gaudino

**Course:** EURECOM - Interaction Design and Development of Modern Web Applications

## Key Value Propositions

- Authenticity: Guests enjoy unique, home-cooked dishes crafted with fresh ingredients and secret family recipes.
- Connection: The platform transforms dining into a social event, encouraging meaningful "bla bla" and community building.
- Opportunity: Hosts can monetize their cooking skills to earn supplemental income, while guests find high-quality meals that fit their budget.

## Core Functionalities:

- Dynamic Discovery: A comprehensive search system that allows guests to filter dining experiences by date, time, group size, and cuisine type.
- Real-time Management: A robust backend handles atomic booking transactions, ensuring seat availability is updated instantly via database triggers.
- Trust & Safety: Integrated rating systems allow guests to share feedback on past bookings, maintaining high quality across the community.

## Technology stack:

**Frontend:**

- Vue.js and Node.js for a responsive, interactive user interface.
- Styling: Modern CSS3
- Special features:
  - Sessions stored in localStorage (valid for 1 day)
  - Leaflet map to find exact locations
  - Video at landing page
  - Responsive design optimized for both desktop and mobile devices
  - Communication with backendvia Fetch API
  - Forms to capture user input

**Backend:**

- Express.js
- SQLite persistent storage (with the schemas can be easily migrated to other enterprise-level DBMS like PostgreSQL)
- Special features:
  - JWT-based authentication for secure user sessions
  - Database triggers for real-time booking management

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
