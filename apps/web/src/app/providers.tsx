"use client";

import { ReactNode } from "react";
import { WagmiConfig, createClient, configureChains } from "wagmi";
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

const { provider, webSocketProvider } = configureChains(
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

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

const Providers = ({ children }: { children: ReactNode }) => {
  return <WagmiConfig client={client}>{children}</WagmiConfig>;
};

export default Providers;
