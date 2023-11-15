import "./App.css";
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

const client = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={client}>
            <WagmiConfig config={config}>
                <ConnectKitProvider theme="midnight">
                    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                        <main className="xl:w-[1280px] lg:w-[960px] md:w-[720px] sm:w-[540px] w-full mx-auto px-4 shrink-0 bg-[#0d0b0d] text-white">
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

    function getChainIcon() {
        if (!chain) {
            return <div />;
        }
        return <ChainIcon id={chain?.id} unsupported={chain?.unsupported} size={35} />;
    }

    return (
        <div className="flex flex-row min-w-full justify-between items-center mb-[1.5rem]">
            <div className="w-[200px]">
                <img src={getSVG("logo")} alt="Logo" />
            </div>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuLink href='/arbi' className={navigationMenuTriggerStyle()}>
                            Arbitrum Index
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
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
