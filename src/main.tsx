import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Admin, Arbi } from "./lib/pages/main";

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
                path: "/arbi",
                element: <Arbi />,
            },
            {
                path: "/admin",
                element: <Admin />,
            }
        ]
    },

]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <RouterProvider router={router} />
);
