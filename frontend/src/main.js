import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./style.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

console.log("Current API URL:", import.meta.env.VITE_API_URL);

app.mount("#app");
