export const ROLES = {
  CHEF: "chef",
  USER: "user",
};

export const ROUTES = {
  LOGIN: "LoginPage",
  CHEF_DASHBOARD: "ChefDashboard",
  USER_DASHBOARD: "UserDashboard",
};

export const API_ENDPOINTS = {
  // TODO: Define API endpoints for authentication, meals, bookings, etc.
};

export const MEAL_CUISINES = [
  "Italian",
  "Asian",
  "Mexican",
  "Indian",
  "Chinese",
  "French",
  "Mediterranean",
  "American",
];

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN: 8,
  NAME_MIN: 2,
};
