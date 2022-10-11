import Inicio from "./pages/Inicio";

const routes = [
    {
        path: "/*",
        component: Inicio,
        name: "Inicio",
        meta: { title: "Inicio" },
    },
];
export default routes;