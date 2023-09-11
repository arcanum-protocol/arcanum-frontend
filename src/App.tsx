import "./App.css";
import { WagmiConfig } from "wagmi";
import {
    ConnectKitButton,
    ConnectKitProvider,
} from "connectkit";
import * as React from 'react';
import { useLocation } from 'react-router-dom'
import { Link, Outlet } from "react-router-dom";
import Modal from 'react-modal';
Modal.setAppElement('#root');
import { useMobileMedia } from "./hooks/tokens";

import { config } from './config';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getSVG } from "./lib/svg-adapter";

const client = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={client}>
            <WagmiConfig config={config}>
                <ConnectKitProvider theme="midnight">
                    <main>
                        <Navbar />
                        <Outlet />
                    </main >
                </ConnectKitProvider>
            </WagmiConfig>
        </QueryClientProvider>
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
                <img src={getSVG("logo")} />
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
                <img src={getSVG("closeIcon")} />
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
                    <img src={getSVG("navMenuIcon")} />
                </div >
                    :
                    <div />
            }
            { }
            <div style={{ display: "flex", width: "40px", height: "40px", flex: "1", alignContent: "center", justifyContent: "flex-start" }}>
                <img src={getSVG("logo")} />
            </div>
            {!isMobile ? references : <div />}
            <div style={{ display: "flex", flex: "1", justifyContent: "flex-end", alignItems: "center", gap: "5px" }}>
                <ConnectKitButton />
            </div>
        </div>
    </nav >);
}

export { App };
