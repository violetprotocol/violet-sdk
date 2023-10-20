"use client";

import { CLIENT_ID, LOCAL_API_URL, REDIRECT_URL } from "@/constants";
import { VioletProvider, createVioletClient } from "@violetprotocol/sdk";
import {
  arbitrum,
  arbitrumGoerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
} from "@wagmi/core/chains";
import { ReactNode } from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    arbitrumGoerli,
    arbitrum,
    polygonMumbai,
    optimismGoerli,
    optimism,
    polygon,
  ],
  [publicProvider()],
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});

const client = createVioletClient({
  clientId: CLIENT_ID,
  apiUrl: LOCAL_API_URL,
  redirectUrl: REDIRECT_URL,
});

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={config}>
      <VioletProvider client={client}>{children}</VioletProvider>
    </WagmiConfig>
  );
};

export default Providers;
