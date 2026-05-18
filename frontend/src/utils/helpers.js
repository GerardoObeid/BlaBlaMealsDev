import { VALIDATION_RULES } from "./constants";

export const helpers = {
  validateEmail(email) {
    return VALIDATION_RULES.EMAIL.test(email);
  },

  validatePassword(password) {
    return password.length >= VALIDATION_RULES.PASSWORD_MIN;
  },

  validateName(name) {
    return name.trim().length >= VALIDATION_RULES.NAME_MIN;
  },

  formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString();
  },

  formatDateTime(dateTime) {
    if (!dateTime) return "";
    const d = new Date(dateTime);
    return d.toLocaleString();
  },

  formatCurrency(amount) {
    return `€${parseFloat(amount).toFixed(2)}`;
  },

  setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  },

  getLocalStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error("Storage error:", e);
      return null;
    }
  },

  removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Storage error:", e);
    }
  },

  clearLocalStorage() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Storage error:", e);
    }
  },

  getToken() {
    return this.getLocalStorage("authToken");
  },

  setToken(token) {
    this.setLocalStorage("authToken", token);
  },

  removeToken() {
    this.removeLocalStorage("authToken");
  },

  getCurrentUser() {
    return this.getLocalStorage("currentUser");
  },

  setCurrentUser(user) {
    this.setLocalStorage("currentUser", user);
  },

  removeCurrentUser() {
    this.removeLocalStorage("currentUser");
  },
};
