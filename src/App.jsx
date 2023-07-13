import './App.css';
import { WagmiConfig, createConfig } from "wagmi";
import { polygonMumbai } from 'wagmi/chains';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from "connectkit";

const config = createConfig(
    getDefaultConfig({
        alchemyId: 'K7c6nsX9dY6D4OhdtkKc2f05yEcFdtqU',
        walletConnectProjectId: '1d63d7e43fd1d5ea177bdb4a8939ade4',

        chains: [polygonMumbai],

        // Required
        appName: 'ARCANUM',

        // Optional
        appDescription: 'Decentralized asset management protocol that allows to create complicated asset management portfolio and manage them in a DeFi manner.',
        appUrl: 'https://arcanum.to',
        appIcon: 'https://arcanum.to/logo.png'
    })
);


function App() {
    return (
        <WagmiConfig config={config}>
            <ConnectKitProvider>
                    /* Your App */
                <ConnectKitButton />
            </ConnectKitProvider>
        </WagmiConfig>
    );
}

export default App;
