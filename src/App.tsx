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
    ListItem,
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
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
                        "--ck-scrollbar-width": "100%"
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

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

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
                        <NavigationMenuTrigger>Socials</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid gap-3 p-4 md:grid-cols-1 w-32">
                                <NavigationMenuLink>
                                    <a href='https://twitter.com/0xArcanum'>
                                        <div className="flex gap-2 text-lg font-medium">
                                            <div className="w-3 h-5">
                                                <svg viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="white" />
                                                </svg>
                                            </div>
                                            Twitter
                                        </div>
                                    </a>
                                </NavigationMenuLink>
                                <NavigationMenuLink href='https://discord.gg/nqJfDgtx82'>
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36">
                                                <path fill="#fff" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                                            </svg>
                                        </div>
                                        Discord
                                    </div>
                                </NavigationMenuLink>
                                <NavigationMenuLink href='https://dune.com/badconfig/arcanum'>
                                    <div className="flex gap-2">
                                        <div className="w-5 h-5">
                                            <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M150 300C232.843 300 300 232.843 300 150C300 67.1575 232.843 0.000244141 150 0.000244141C67.1573 0.000244141 0 67.1575 0 150C0 232.843 67.1573 300 150 300Z" fill="#F06040" />
                                                <path d="M26 234.405C26 234.405 125.092 201.946 299.739 145C299.739 145 309.305 238.257 212.626 286.901C212.626 286.901 164.951 309.75 112.648 295.093C112.648 295.093 60.5661 285.262 26 234.405Z" fill="#2B286C" />
                                            </svg>
                                        </div>
                                        Dune
                                    </div>
                                </NavigationMenuLink>
                            </ul>
                        </NavigationMenuContent>
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
