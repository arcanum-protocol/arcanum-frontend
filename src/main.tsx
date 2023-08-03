import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Swap } from "./pages/swap";
import { Arbi, Custom } from "./pages/main";

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
                path: "/arbi",
                element: <Arbi />,
                children: [
                    {
                        path: "?address=*",
                        element: <Custom />,
                    },
                ]
            },
        ]
    },

]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
