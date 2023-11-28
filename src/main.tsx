import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Arbi, Custom, Bali, Cpt } from "./lib/pages/main";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Arbi />,
            },
            {
                path: "/multipool",
                element: <Custom />,
            },
            {
                path: "/arbi",
                element: <Arbi />,
            },
            {
                path: "/cpt",
                element: <Cpt />,
            },
            {
                path: "/bali",
                element: <Bali />,
            },
        ]
    },

]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <RouterProvider router={router} />
);
