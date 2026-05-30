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
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },
  MEALS: {
    LIST: "/api/meals",
    CREATE: "/api/meals",
    UPDATE: (id) => `/api/meals/${id}`,
    DELETE: (id) => `/api/meals/${id}`,
    GET_USER_MEALS: "/api/meals/user/meals",
  },
  EVENTS: {
    LIST: "/api/events",
    CREATE: "/api/events",
    SEARCH: "/api/events/search",
    UPDATE: (id) => `/api/events/${id}`,
    DELETE: (id) => `/api/events/${id}`,
    GET_USER_EVENTS: "/api/events/user/events",
    GET_GUESTS: (id) => `/api/events/${id}/guests`,
    REMOVE_GUEST: (eventId, bookingId) => `/api/events/${eventId}/guests/${bookingId}`,
  },
  BOOKINGS: {
    CREATE: "/api/bookings",
    LIST: "/api/bookings",
    DELETE: (id) => `/api/bookings/${id}`,
    RATE: (id) => `/api/bookings/${id}/rate`,
  },
  USERS: {
    PROFILE: "/api/users/profile",
    DASHBOARD: "/api/users/dashboard",
  },
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
