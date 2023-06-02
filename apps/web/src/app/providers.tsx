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

import { VioletProvider } from "@violetprotocol/sdk";

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

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={config}>
      <VioletProvider>{children}</VioletProvider>
    </WagmiConfig>
  );
};

export default Providers;
