import { helpers } from "../utils/helpers";
import { authStore } from "../session/authStore";

class ApiClient {
  // Here goes the base URL of our API, eventually this needs to be changed to our production URL
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
    this.timeout = 10000;
  }

  getFullUrl(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  // This is the main request method that will be used by all other HTTP methods (GET, POST, PUT, DELETE)
  async request(method, endpoint, data = null, headers = {}) {
    const token = helpers.getToken();
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers: defaultHeaders,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(this.getFullUrl(endpoint), config);

      if (!response.ok) {
        if (response.status === 401) {
          authStore.logout();
          window.location.href = "/login";
          throw new Error("Unauthorized");
        }

        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  get(endpoint, headers) {
    return this.request("GET", endpoint, null, headers);
  }

  post(endpoint, data, headers) {
    return this.request("POST", endpoint, data, headers);
  }

  put(endpoint, data, headers) {
    return this.request("PUT", endpoint, data, headers);
  }

  delete(endpoint, headers) {
    return this.request("DELETE", endpoint, null, headers);
  }
}

export const api = new ApiClient("http://localhost:3000");
