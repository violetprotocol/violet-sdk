"use client";

import { ReactNode } from "react";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import {
  mainnet,
  arbitrumGoerli,
  arbitrum,
  polygonMumbai,
  optimismGoerli,
  optimism,
  polygon,
} from "@wagmi/core/chains";
import { publicProvider } from "wagmi/providers/public";
import { VioletProvider, createVioletClient } from "@violetprotocol/sdk";
import { CLIENT_ID, REDIRECT_URL, LOCAL_API_URL } from "@/constants";

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
  [publicProvider()]
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
