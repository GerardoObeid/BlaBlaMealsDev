# Frontend Documentation

Here will go the frontend using VUE.js. The frontend will provide a user interface for the application, allowing users to interact with the features and functionalities. It will communicate with the backend API to fetch and display data, as well as handle user input and actions.

## Project Structure

```
src/
├── components/          # Vue.js components (.vue)
│   ├── common/         # Header, Navigation, LoginPage, LandingPage
│   ├── chef/           #  TBD
│   └── user/           #  TBD
├── services/           # TODO: API calls
│   ├── api.js
│   ├── authService.js
│   ├── mealService.js
│   └── userService.js
├── stores/             # State management
│   ├── authStore.js
│   ├── mealStore.js
│   └── userStore.js
├── utils/              # Helpers & constants
│   ├── constants.js
│   └── helpers.js
├── assets/             # CSS & images
│   ├── css/
│   └── images/
└── App.vue             # Root component
```

To test the frontend, you can run the development server using the following command:

```bash
    npm install
    npm run dev
```

This will start the VUE development server, and you can access the application in your web browser at `http://localhost:5173`
