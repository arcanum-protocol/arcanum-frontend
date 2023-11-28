import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Arbi, Custom } from "./lib/pages/main";

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
            }
        ]
    },

]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <RouterProvider router={router} />
);
