import { reactive } from "vue";
import { helpers } from "../utils/helpers";
import { ROLES } from "../utils/constants";

class AuthStore {
  constructor() {
    this.state = reactive({
      user: helpers.getCurrentUser(),
      token: helpers.getToken(),
      isAuthenticated: !!helpers.getToken(),
      isLoading: false,
      error: null,
    });
  }

  login(userData, token) {
    this.state.user = userData;
    this.state.token = token;
    this.state.isAuthenticated = true;
    this.state.error = null;
    helpers.setCurrentUser(userData);
    helpers.setToken(token);
  }

  logout() {
    this.state.user = null;
    this.state.token = null;
    this.state.isAuthenticated = false;
    this.state.error = null;
    helpers.removeCurrentUser();
    helpers.removeToken();
  }

  setLoading(loading) {
    this.state.isLoading = loading;
  }

  setError(error) {
    this.state.error = error;
  }

  clearError() {
    this.state.error = null;
  }

  getUser() {
    return this.state.user;
  }

  isChef() {
    return this.state.user?.role === ROLES.CHEF;
  }

  isAuthenticated() {
    return this.state.isAuthenticated;
  }
}

export const authStore = new AuthStore();
