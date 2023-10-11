import "./App.css";
import { WagmiConfig, useNetwork } from "wagmi";
import {
    ChainIcon,
    ConnectKitButton,
    ConnectKitProvider,
} from "connectkit";
import { Link, Outlet } from "react-router-dom";
import Modal from 'react-modal';
Modal.setAppElement('#root');

import { config, moralisConfig } from './config';
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
        <div className="w-full flex flex-row justify-between items-center">
            <div className="flex items-center justify-center w-12 h-12">
                <img src={getSVG("logo")} />
            </div>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <Link to="/swap">
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Swap
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link to="/arbi">
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                ARBI
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link to="https://docs.arcanum.to">
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Documentation
                            </NavigationMenuLink>
                        </Link>
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
