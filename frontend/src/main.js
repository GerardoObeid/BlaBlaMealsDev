import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";

// Global CSS
import "./assets/css/shared/variables.css";
import "./assets/css/shared/buttons.css";
import "./assets/css/shared/forms.css";
import "./assets/css/shared/tabs.css";

const app = createApp(App);
app.use(router);
app.mount("#app");

window.appInstance = app;
