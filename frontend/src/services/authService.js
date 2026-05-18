import { api } from "./api";
import { authStore } from "../session/authStore";
import { helpers } from "../utils/helpers";
import { API_ENDPOINTS, ROLES } from "../utils/constants";

class AuthService {
  // Login method that with the API endpoint and handles the response, storing the token and user info in local storage and auth store
  async login(email, password) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      if (response.token) {
        helpers.setToken(response.token);
        helpers.setCurrentUser(response.user);
        authStore.login(response.user, response.token);
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async signup(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, userData);

      if (response.token) {
        helpers.setToken(response.token);
        helpers.setCurrentUser(response.user);
        authStore.login(response.user, response.token);
      }

      return response;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }
  // Logout method that calls the API endpoint to invalidate the token and clears local storage and auth store
  async logout() {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      helpers.removeToken();
      helpers.removeCurrentUser();
      authStore.logout();
    }
  }

  isAuthenticated() {
    return !!helpers.getToken();
  }

  getCurrentUser() {
    return helpers.getCurrentUser();
  }

  isChef() {
    const user = this.getCurrentUser();
    return user?.role === ROLES.CHEF;
  }
  // Method to refresh the authentication token using the refresh token endpoint
  async refreshToken() {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REFRESH);
      if (response.token) {
        helpers.setToken(response.token);
        authStore.login(response.user, response.token);
      }
      return response;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();
