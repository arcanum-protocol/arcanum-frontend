import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

import { RouterProvider, createBrowserRouter, useRouteError } from "react-router-dom";
import { Admin, Arbi, SPI } from "./lib/pages/multipool";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "./lib/pages/analytics";
import { Farms } from "./lib/pages/farm";


function ErrorBoundary() {
    const error = useRouteError();
    const { toast } = useToast();

    return (
        <>
            <Toaster />
            <svg width="35" height="36" viewBox="0 0 35 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="Group 59">
                    <rect id="Rectangle 1522" y="0.548828" width="34.9922" height="34.9922" rx="5.49639" fill="white" />
                    <g id="Group 28">
                        <path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M17.5419 25.6237C23.4677 25.6237 28.6096 21.9097 31.1695 19.6722C32.201 18.7707 32.201 17.2642 31.1695 16.3627C28.6096 14.1251 23.4677 10.4111 17.5419 10.4111C11.6161 10.4111 6.47424 14.1251 3.91421 16.3627C2.88276 17.2642 2.88276 18.7707 3.91421 19.6722C6.47424 21.9097 11.6161 25.6237 17.5419 25.6237ZM17.5419 23.3241C20.535 23.3241 22.9613 20.9483 22.9613 18.0174C22.9613 15.0866 20.535 12.7107 17.5419 12.7107C14.5488 12.7107 12.1225 15.0866 12.1225 18.0174C12.1225 20.9483 14.5488 23.3241 17.5419 23.3241Z" fill="black" />
                        <circle id="Ellipse 18" cx="17.4915" cy="18.0403" r="5.511" fill="white" />
                    </g>
                </g>
            </svg>
            <div className="text-gray-300 pb-2">
                <div className="text-xl">Something went wrong</div>
                <div className="text-sm underline-offset-2 underline">Try refreshing the page</div>

            </div>
            <div>
                <div className="text-gray-300 p-4 h-96 bg-[#0c0a09] rounded-t-lg border border-[#292524]">
                    {error.toString()}
                </div>
                <div className="text-gray-500 bg-[#0c0a09] border border-[#292524] rounded-b-lg cursor-pointer" onClick={() => {
                    navigator.clipboard.writeText(error.toString());
                    toast({
                        title: "Copied to clipboard!",
                        description: "The error message has been copied to your clipboard",
                        duration: 5000
                    });
                }}>
                    Copy
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.2 1H4.17741H4.1774C3.86936 0.999988 3.60368 0.999978 3.38609 1.02067C3.15576 1.04257 2.92825 1.09113 2.71625 1.22104C2.51442 1.34472 2.34473 1.51442 2.22104 1.71625C2.09113 1.92825 2.04257 2.15576 2.02067 2.38609C1.99998 2.60367 1.99999 2.86935 2 3.17738V3.1774V3.2V11.8V11.8226V11.8226C1.99999 12.1307 1.99998 12.3963 2.02067 12.6139C2.04257 12.8442 2.09113 13.0717 2.22104 13.2837C2.34473 13.4856 2.51442 13.6553 2.71625 13.779C2.92825 13.9089 3.15576 13.9574 3.38609 13.9793C3.60368 14 3.86937 14 4.17741 14H4.2H10.8H10.8226C11.1306 14 11.3963 14 11.6139 13.9793C11.8442 13.9574 12.0717 13.9089 12.2837 13.779C12.4856 13.6553 12.6553 13.4856 12.779 13.2837C12.9089 13.0717 12.9574 12.8442 12.9793 12.6139C13 12.3963 13 12.1306 13 11.8226V11.8V3.2V3.17741C13 2.86936 13 2.60368 12.9793 2.38609C12.9574 2.15576 12.9089 1.92825 12.779 1.71625C12.6553 1.51442 12.4856 1.34472 12.2837 1.22104C12.0717 1.09113 11.8442 1.04257 11.6139 1.02067C11.3963 0.999978 11.1306 0.999988 10.8226 1H10.8H4.2ZM3.23875 2.07368C3.26722 2.05623 3.32362 2.03112 3.48075 2.01618C3.64532 2.00053 3.86298 2 4.2 2H10.8C11.137 2 11.3547 2.00053 11.5193 2.01618C11.6764 2.03112 11.7328 2.05623 11.7613 2.07368C11.8285 2.11491 11.8851 2.17147 11.9263 2.23875C11.9438 2.26722 11.9689 2.32362 11.9838 2.48075C11.9995 2.64532 12 2.86298 12 3.2V11.8C12 12.137 11.9995 12.3547 11.9838 12.5193C11.9689 12.6764 11.9438 12.7328 11.9263 12.7613C11.8851 12.8285 11.8285 12.8851 11.7613 12.9263C11.7328 12.9438 11.6764 12.9689 11.5193 12.9838C11.3547 12.9995 11.137 13 10.8 13H4.2C3.86298 13 3.64532 12.9995 3.48075 12.9838C3.32362 12.9689 3.26722 12.9438 3.23875 12.9263C3.17147 12.8851 3.11491 12.8285 3.07368 12.7613C3.05624 12.7328 3.03112 12.6764 3.01618 12.5193C3.00053 12.3547 3 12.137 3 11.8V3.2C3 2.86298 3.00053 2.64532 3.01618 2.48075C3.03112 2.32362 3.05624 2.26722 3.07368 2.23875C3.11491 2.17147 3.17147 2.11491 3.23875 2.07368ZM5 10C4.72386 10 4.5 10.2239 4.5 10.5C4.5 10.7761 4.72386 11 5 11H8C8.27614 11 8.5 10.7761 8.5 10.5C8.5 10.2239 8.27614 10 8 10H5ZM4.5 7.5C4.5 7.22386 4.72386 7 5 7H10C10.2761 7 10.5 7.22386 10.5 7.5C10.5 7.77614 10.2761 8 10 8H5C4.72386 8 4.5 7.77614 4.5 7.5ZM5 4C4.72386 4 4.5 4.22386 4.5 4.5C4.5 4.77614 4.72386 5 5 5H10C10.2761 5 10.5 4.77614 10.5 4.5C10.5 4.22386 10.2761 4 10 4H5Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                </div>
            </div>
            <div className="text-gray-300">
                Please send a bug report to our {" "}
                <svg width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36"><path fill="#fff" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
                <a className="text-blue-600" href="https://discord.gg/yKVttzAMgX" target="_blank">Discord</a>
            </div>
        </>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorBoundary />,
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
            },
            {
                path: "/spi",
                element: <SPI />,
            }, 
            {
                path: "*",
                element: <ErrorBoundary />,
            },
            {
                path: "/analytics/:id",
                element: <Analytics />,
            }, 
            {
                path: "/farms",
                element: <Farms />,
            }
        ]
    },

]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <RouterProvider router={router} />
);
