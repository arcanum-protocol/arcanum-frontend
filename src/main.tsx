import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Swap } from "./pages/swap";
import { Arbi, Custom, Bali, Cpt } from "./pages/main";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Swap />,
            },
            {
                path: "/swap",
                element: <Swap />,
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
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
