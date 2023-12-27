import { WagmiConfig, useNetwork } from "wagmi";
import {
    ChainIcon,
    ConnectKitButton,
    ConnectKitProvider,
} from "connectkit";
import { Outlet } from "react-router-dom";

import { config } from './config';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getSVG } from "./lib/svg-adapter";
import { ThemeProvider } from "./contexts/ThemeProvider";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import "../app/globals.css";
import { useState } from "react";
import { Toaster } from "./components/ui/toaster";

const client = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={client}>
            <WagmiConfig config={config}>
                <ConnectKitProvider 
                    theme="midnight" 
                    customTheme={{
                      "--ck-font-family": "'Inconsolata', monospace",
                        /* Modal */
                       "--ck-border-radius": "calc(var(--radius) - 2px)", 
                       "--ck-body-background": "rgb(12 10 9)",
                       /* Primary Button */
                        "--ck-primary-button-color": "#fff",
                        "--ck-primary-button-background": "rgb(12 10 9)",
                        "--ck-primary-button-border-radius": "0px",

                        "--ck-secondary-button-color": "#fff",
                        "--ck-secondary-button-background": "rgb(12 10 9)",
                        "--ck-secondary-button-border-radius": "calc(var(--radius) - 2px)",
                      /* Connect Wallet Button */
                       "--ck-connectbutton-border-radius": "calc(var(--radius) - 2px)",
                       "--ck-connectbutton-color": "#fff", 
                       "--ck-connectbutton-background": "rgb(12 10 9)",
                       "--ck-connectbutton-hover-color": "#fff", 
                       "--ck-connectbutton-hover-background": "rgb(12 10 9)", 
                       "--ck-connectbutton-active-color": "#fff",
                       "--ck-connectbutton-active-background": "rgb(12 10 9)", 
                    }}>
                    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                        <main className="xl:w-[1280px] lg:w-[960px] md:w-[720px] sm:w-[540px] w-full mx-auto xl:px-4 shrink-0 text-white">
                            <Toaster />
                            <Navbar />
                            <Outlet />
                        </main>
                    </ThemeProvider>
                </ConnectKitProvider>
            </WagmiConfig>
        </QueryClientProvider>
    );
}

function Navbar() {
    const { chain } = useNetwork();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function getChainIcon() {
        if (!chain) {
            return <div />;
        }
        return <ChainIcon id={chain?.id} unsupported={chain?.unsupported} size={35} />;
    }

    return (
        <div className="flex flex-row min-w-full justify-between items-center mb-[1.5rem]">
            <div className="z-50 block lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </div>
            {/** Mobile menu, leaves from left to right for 70% of the screen */}
            <div className={`fixed top-0 left-0 w-full h-full bg-[#0d0b0d]/50 backdrop-blur p-4 z-40 transform transition-transform duration-300 ${isMenuOpen ? "-translate-x-1/4" : "-translate-x-full"}`}>
                <div className="flex text-left flex-col items-end h-full pl-24">
                    <img src={getSVG("logo")} alt="Logo" className="w-10" />

                    <div className="w-full text-left text-base py-2" onClick={() => {
                        setIsMenuOpen(false);

                        setTimeout(() => {
                            window.location.href = "/arbi";
                        }, 300);
                    }}>
                        ARBI
                    </div>
                    <div className="w-full text-left text-base py-2" onClick={() => {
                        setIsMenuOpen(false);

                        setTimeout(() => {
                            window.location.href = "https://docs.arcanum.to/overview/about";
                        }, 300);
                    }}>
                        DOCS
                    </div>
                </div>
            </div>
            <div className="hidden lg:block w-[200px]">
                <div className="w-[200px]">
                    <img src={getSVG("logo")} alt="Logo" />
                </div>
            </div>
            <NavigationMenu className={"hidden lg:block"}>
                <NavigationMenuList>
                    <NavigationMenuItem className="border border-[#292524] rounded">
                        <NavigationMenuLink href='/arbi' className={navigationMenuTriggerStyle()}>
                            Arbitrum Index
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="border border-[#292524] rounded">
                        <NavigationMenuLink href='https://docs.arcanum.to' className={navigationMenuTriggerStyle()}>
                            Documentation
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex flex-row justify-center items-center gap-3 w-[225px]">
                {getChainIcon()}
                <ConnectKitButton />
            </div>
        </div>
    );
}

export { App };
