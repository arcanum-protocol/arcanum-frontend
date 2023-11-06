import "./App.css";
import { WagmiConfig, useNetwork } from "wagmi";
import {
    ChainIcon,
    ConnectKitButton,
    ConnectKitProvider,
} from "connectkit";
import { Outlet } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
                        <main>
                            <Navbar />
                            <Outlet />
                        </main >
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
        <div className="w-full flex flex-row justify-between items-center mb-2">
            <Avatar className="h-10 w-10">
                <AvatarImage src={getSVG("logo")} alt="Logo" />
                <AvatarFallback>{"?"}</AvatarFallback>
            </Avatar>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuLink href='/arbi' className={navigationMenuTriggerStyle()}>
                            ARBI
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink href='https://docs.arcanum.to' className={navigationMenuTriggerStyle()}>
                            Documentation
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex flex-row justify-center items-center gap-3">
                {getChainIcon()}
                <ConnectKitButton />
            </div>
        </div>
    );
}

export { App };
