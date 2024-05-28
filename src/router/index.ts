import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/TabsPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/tabs/random",
  },
  {
    path: "/tabs/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/tabs/random",
      },
      {
        name: "random",
        path: "random",
        component: () => import("@/views/RandomPage.vue"),
      },
      {
        name: "pick",
        path: "pick",
        component: () => import("@/views/PickPage.vue"),
      },
      {
        name: "saved",
        path: "saved",
        component: () => import("@/views/SavedPage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
