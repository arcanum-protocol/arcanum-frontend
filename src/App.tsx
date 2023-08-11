import "./App.css";
import { createConfig, useAccount, WagmiConfig } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";
import {
    ChainIcon,
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
import navMenuIcon from '/nav-menu.svg';
import closeIcon from '/close-icon.svg';
Modal.setAppElement('#root');

import logo from '/logo.svg';
import { useMobileMedia } from "./hooks/tokens";

export const polygonMumbai = {
    id: 80001,
    name: 'Polygon Mumbai',
    network: 'Polygon Mumbai',
    nativeCurrency: {
        decimals: 18,
        name: 'MATIC',
        symbol: 'MATIC',
    },
    rpcUrls: {
        public: { http: ['https://rpc.ankr.com/polygon_mumbai'] },
        default: { http: ['https://rpc.ankr.com/polygon_mumbai'] },
    },
    blockExplorers: {
        etherscan: { name: 'PolygonScan', url: 'https://mumbai.polygonscan.com' },
        default: { name: 'PolygonScan', url: 'https://mumbai.polygonscan.com' },
    },
};

export const opBnb = {
    id: 5611,
    name: 'OpBNB Testnet',
    network: 'OpBNB Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'tcBNB',
        symbol: 'tcBNB',
    },
    rpcUrls: {
        public: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
        default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
    },
    blockExplorers: {
        etherscan: { name: 'SnowTrace', url: 'https://opbnb-testnet.bscscan.com' },
        default: { name: 'SnowTrace', url: 'https://opbnb-testnet.bscscan.com' },
    },
};

const config = createConfig(
    getDefaultConfig({
        alchemyId: "K7c6nsX9dY6D4OhdtkKc2f05yEcFdtqU",
        walletConnectProjectId: "1d63d7e43fd1d5ea177bdb4a8939ade4",

        chains: [arbitrumGoerli, polygonMumbai, opBnb],

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
            <ConnectKitProvider theme="midnight">
                <main>
                    <Navbar />
                    <Outlet />
                </main >
            </ConnectKitProvider>
        </WagmiConfig>
    );
}

function Navbar() {
    const { state } = useLocation();
    const [hovered, setHovered] = React.useState(location.pathname);
    const isMobile = useMobileMedia();
    const [mobileReferencesActive, setMobileReferences] = React.useState(false);

    const modal = React.useRef(null);

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (modal.current && !modal.current.contains(event.target)) {
                setMobileReferences(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modal]);

    console.log(state);
    React.useEffect(() => {
        setMobileReferences(false);
    }, [state]);

    const links = [
        { title: "Swap", route: "/swap" },
        { title: "Arbitrum index", route: "/arbi" },
        { title: "Docs", route: "https://docs.arcanum.to" },
    ];

    const references =
        <div style={{ display: "flex", fontSize: "20px", gap: "40px", flex: "1", alignItems: "center", justifyContent: "center" }}>
            {
                links.map(({ title, route }, index) => {
                    let item = <div
                        key={index}
                        style={{
                            display: "flex",
                            borderRadius: "10px",
                            backgroundColor: hovered == route ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0)",
                            color: "var(--wh)",
                        }}
                        onMouseOver={() => { setHovered(route) }}
                        onMouseOut={() => { setHovered(location.pathname) }}
                    >
                        <span style={{ margin: "1px 10px" }}>{title}</span>
                    </div>;
                    return (
                        route.startsWith('/') ?
                            <Link
                                key={index}
                                to={route}
                            >
                                {item}
                            </Link> :
                            <a href={route}
                                key={index}
                            >
                                {item}
                            </a>
                    );
                })
            }
        </div >;

    const mobileMenuModal = <div
        ref={modal}
        style={{
            position: "fixed",
            overflowX: "auto",
            // safari don't support backdrop filters on scailing
            //backdropFilter: "blur(50px)",
            //WebkitBackdropFilter: "blur(50px)",
            backgroundColor: "var(--bc)",
            top: "0",
            left: "0",
            height: "100vh",
            zIndex: "1",
            display: "flex",
            gap: "10px",
            justifyItems: "flex-start",
            flexDirection: "column",
            width: "300px",
            transition: "max-width .5s",
            maxWidth: mobileReferencesActive ? "300px" : "0px",
        }}>
        <div style={{ marginLeft: "10px", marginTop: "10px", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", width: "40px", height: "40px", flex: "1", justifyContent: "flex-start" }}>
                <img src={logo} />
            </div>
            <div style={{
                display: "flex",
                width: "30px",
                height: "30px",
                flex: "1",
                justifyContent: "flex-end",
                marginRight: "10px",
            }}
                onClick={() => setMobileReferences(false)}
            >
                <img src={closeIcon} />
            </div>
        </div>
        <div style={{
            marginLeft: "10px",
            marginTop: "10px", flexDirection: "column",
            gap: "20px",
            display: "flex", alignItems: "flex-start"
        }}>
            {
                links.map(({ title, route }, index) => {
                    let item = <div
                        key={index}
                        style={{
                            display: "flex",
                            borderRadius: "10px",
                            color: "var(--wh)",
                        }}
                    >
                        <span>{title}</span>
                    </div>;
                    return (
                        route.startsWith('/') ?
                            <Link key={index} to={route}
                                state={{ reloaded: route }}
                            >
                                {item}
                            </Link> :
                            <a key={index}
                                href={route}>
                                {item}
                            </a>
                    );
                })
            }
        </div>
    </div >;

    return (<nav>
        <div style={{
            display: "flex", alignItems: "center", width: "100%",
            overflow: "auto"
        }}>
            {mobileMenuModal}
            {
                isMobile ? <div
                    onClick={e => setMobileReferences(true)}
                    style={{ display: "flex", marginRight: "10px" }}>
                    <img src={navMenuIcon} />
                </div >
                    :
                    <div />
            }
            {}
            <div style={{ display: "flex", width: "40px", height: "40px", flex: "1", alignContent: "center", justifyContent: "flex-start" }}>
                <img src={logo} />
            </div>
            {!isMobile ? references : <div />}
            <div style={{ display: "flex", flex: "1", justifyContent: "flex-end", alignItems: "center", gap: "5px" }}>
                <ConnectKitButton />
            </div>
        </div>
    </nav >);
}

export default App;
