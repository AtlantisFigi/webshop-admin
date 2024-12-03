import { createRouter, createWebHistory} from "vue-router";
import Products from "./components/Products.vue";


const routes = [
    {
        path: '/',
        component: Products,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _from, next) => {
        next();
})

export default router;