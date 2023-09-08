import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { WagmiConfig } from "wagmi";
import {
    ConnectKitButton,
    ConnectKitProvider,
} from "connectkit";
import { useLocation, Link, Outlet } from 'react-router-dom';
import { getSVG } from "./lib/svg-adapter";
import { useMobileMedia } from "./hooks/tokens";
import { config } from './config';
import Modal from 'react-modal';

import "./App.css";
Modal.setAppElement('#root');

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
    const { pathname } = useLocation();
    const isMobile = useMobileMedia();
    const [hovered, setHovered] = useState(pathname);
    // const [mobileReferencesActive, setMobileReferences] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                // setMobileReferences(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [Modal]);

    // useEffect(() => {
    //     setMobileReferences(false);
    // }, [pathname]);

    const links = [
        { title: "Swap", route: "/swap" },
        { title: "Arbitrum index", route: "/arbi" },
        { title: "Docs", route: "https://docs.arcanum.to" },
    ];

    const references = (
        <div style={{ display: "flex", fontSize: "20px", gap: "40px", flex: "1", alignItems: "center", justifyContent: "center" }}>
            {links.map(({ title, route }, index) => {
                const isRoute = route.startsWith('/');
                const item = (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            borderRadius: "10px",
                            backgroundColor: hovered === route ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0)",
                            color: "var(--wh)",
                        }}
                        onMouseOver={() => setHovered(route)}
                        onMouseOut={() => setHovered(pathname)}
                    >
                        <span style={{ margin: "1px 10px" }}>{title}</span>
                    </div>
                );

                return isRoute ? (
                    <Link key={index} to={route}>
                        {item}
                    </Link>
                ) : (
                    <a key={index} href={route}>
                        {item}
                    </a>
                );
            })}
        </div>
    );

    return (
        <nav>
            <div style={{ display: "flex", alignItems: "center", width: "100%", overflow: "auto" }}>
                {isMobile && (
                    <div onClick={/*() => setMobileReferences(true) */ () => console.log("placeholder")} style={{ display: "flex", marginRight: "10px" }}>
                        <img src={getSVG("nav-menu")} />
                    </div>
                )}
                <div style={{ display: "flex", width: "40px", height: "40px", flex: "1", alignContent: "center", justifyContent: "flex-start" }}>
                    <img src={getSVG("logo")} />
                </div>
                {!isMobile ? references : <div />}
                <div style={{ display: "flex", flex: "1", justifyContent: "flex-end", alignItems: "center", gap: "5px" }}>
                    <ConnectKitButton />
                </div>
            </div>
        </nav>
    );
}

export { App, Navbar };
