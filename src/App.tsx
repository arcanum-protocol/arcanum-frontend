import "./App.css";
import { createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai, sepolia } from "wagmi/chains";
import {
    ConnectKitButton,
    ConnectKitProvider,
    getDefaultConfig,
} from "connectkit";
import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import { Fragment } from "react";
import { Swap } from "./components/swap";
import { Arbi } from "./components/arbi";
import * as React from 'react';
import { MintBurn } from "./components/mint-burn";

import logo from '../public/logo.svg';

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
        <Router>
            <WagmiConfig config={config}>
                <ConnectKitProvider theme="soft">
                    <main>
                        <nav>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div style={{ display: "flex", width: "40px", height: "40px", flex: "1", justifyContent: "flex-start" }}>
                                    <img src={logo} />
                                </div>
                                <div style={{ display: "flex", fontSize: "20px", gap: "40px", flex: "1", justifyContent: "center" }}>
                                    <div style={{ display: "flex" }}>
                                        <Link to="/">Home</Link>
                                    </div>
                                    <div style={{ display: "flex" }}>
                                        <Link to="/swap">Swap</Link>
                                    </div>
                                    <div style={{ display: "flex" }}>
                                        <Link to="/mint">$ARBI</Link>
                                    </div>
                                    <div style={{ display: "flex" }}>
                                        <Link to="/arbi">Arbitrum index</Link>
                                    </div>
                                </div>
                                <div style={{ display: "flex", flex: "1", justifyContent: "flex-end" }}>
                                    <ConnectKitButton />
                                </div>
                            </div>

                        </nav>

                        <Routes>
                            <Route path="/" exact element={<Home />} />
                            <Route path="/swap" element={<Swap />} />
                            <Route path="/mint" element={<MintBurn />} />
                            <Route path="/arbi" element={<Arbi />} />
                            <Route path="*" exact element={<NotFound />} />
                        </Routes>
                    </main>
                </ConnectKitProvider>
            </WagmiConfig>
        </Router >
    );
}

const Home = () => (
    <Fragment>
        <h1>Home</h1>
    </Fragment>
);
const NotFound = () => <h1>Not found</h1>;

export default App;
