import "./App.css";
import { createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai, sepolia } from "wagmi/chains";
import {
    ConnectKitButton,
    ConnectKitProvider,
    getDefaultConfig,
} from "connectkit";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Swap } from "./pages/swap";
import { Arbi } from "./pages/arbi";
import * as React from 'react';
import { useLocation } from 'react-router-dom'
import { Link, Outlet } from "react-router-dom";
import Modal from 'react-modal';
Modal.setAppElement('#root');

import logo from '/logo.svg';

const config = createConfig(
    getDefaultConfig({
        alchemyId: "K7c6nsX9dY6D4OhdtkKc2f05yEcFdtqU",
        walletConnectProjectId: "1d63d7e43fd1d5ea177bdb4a8939ade4",

        chains: [polygonMumbai, sepolia],

        // Required
        appName: "ARCANUM",

        // Optional
        appDescription:
            "Decentralized asset management protocol that allows to create complicated asset management portfolio and manage them in a DeFi manner.",
        appUrl: "https://arcanum.to",
        appIcon: "https://arcanum.to/logo.png",
    }),
);

function App() {
    return (
        <WagmiConfig config={config}>
            <ConnectKitProvider theme="soft">
                <main>
                    <Navbar />
                    <Outlet />
                </main >
            </ConnectKitProvider>
        </WagmiConfig>
    );
}

function Navbar() {
    const location = useLocation();
    console.log(location.pathname);
    const [hovered, setHovered] = React.useState(location.pathname);
    return (<nav>
        <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", width: "40px", height: "40px", flex: "1", justifyContent: "flex-start" }}>
                <img src={logo} />
            </div>
            <div style={{ display: "flex", fontSize: "20px", gap: "40px", flex: "1", justifyContent: "center" }}>
                {
                    [
                        { title: "Swap", route: "/swap" },
                        { title: "Arbitrum index", route: "/arbi" },
                        { title: "Docs", route: "https://docs.arcanum.to" },
                    ].map(({ title, route }, index) => {
                        let item = <div
                            style={{
                                display: "flex",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                backgroundColor: hovered == route ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0)",
                                color: "var(--wh)",
                            }}
                            onMouseOver={e => { setHovered(route) }}
                            onMouseOut={e => { setHovered(location.pathname) }}
                        >
                            <span>{title}</span>
                        </div>;
                        return (
                            route.startsWith('/') ?
                                <Link key={index} to={route}>
                                    {item}
                                </Link> :
                                <a href={route}>
                                    {item}
                                </a>
                        );
                    })
                }
            </div>
            <div style={{ display: "flex", flex: "1", justifyContent: "flex-end" }}>
                <ConnectKitButton />
            </div>
        </div>
    </nav >);
}

const NotFound = () => <h1>Not found</h1>;

export default App;
