"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount, useConnect, useNetwork } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useViolet } from "sdk";
import {
  mainnet,
  arbitrumGoerli,
  arbitrum,
  polygonMumbai,
  optimismGoerli,
  optimism,
  polygon,
} from "@wagmi/core/chains";

const chainIds = {
  mainnet: mainnet.id,
  arbitrum_goerli: arbitrumGoerli.id,
  arbitrum: arbitrum.id,
  polygon_mumbai: polygonMumbai.id,
  optimism_goerli: optimismGoerli.id,
  optimism: optimism.id,
  polygon: polygon.id,
} as const;

const getHumanBoundContractAddressByNetworkId = (chainId: number) => {
  switch (chainId) {
    case chainIds.mainnet:
      return "0x594e5550ece2c10e5d580e538871914f55884f5d";
    case chainIds.arbitrum_goerli:
      return "0x8d39fe83ed158f1b7e21a6434e0878d6c11f02b9";
    case chainIds.arbitrum:
      return "0x5beb956a9af054956c5c6c0afac7b109236f86aa";
    case chainIds.polygon_mumbai:
      return "0x1888649d566908e0a4ac17978740f6a04f600a51";
    case chainIds.optimism_goerli:
      return "0x5e5007bdd3eb92575499e17eabdd411b42cf79c0";
    case chainIds.optimism:
      return "0xff439ba52825ffd65e39fd2bf519566d0cd91827";
    case chainIds.polygon:
      return "0x41be3a6c17cf76442d9e7b150de4870027d36f52";
    default:
      throw new Error("Not supported chainId");
  }
};

// This will be generated from Violet
const REDIRECT_URL = "http://localhost:3000";
const CLIENT_ID =
  "be7cbd47d3b070de1dd56185b2e9bd51cdf73491e333a86bb98885c1364b1214";

// This will be generated from the ABI
const TX_FUNCTION_SIGNATURE = "0x50d41df3";
const TX_DATA =
  "0x000000000000000000000000d00f7eddc37631bc7bd9ebad8265b2785465a3b7000000000000000000000000000000000000000000000000000000001adc34a100000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000";

const BRAND_COLOR = "#9a4cff";
const ERROR_COLOR = "#dc2626";

const Page = () => {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { authorize } = useViolet({
    redirectUrl: REDIRECT_URL,
    clientId: CLIENT_ID,
  });
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<string>();
  const [hasMounted, setHasMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");

    const error = searchParams.get("error_code");

    if (error) {
      setError(error);
    }

    if (token) {
      setToken(token);
    }

    const params = {};

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    if (Object.keys(params).length === 0) return;

    console.table(params);

    router.replace("/");
  }, [searchParams, router]);

  if (!hasMounted) return null;

  return (
    <main className="flex h-screen justify-center items-center">
      {!isConnected ? (
        <div className="h-36 w-36 cursor-pointer" onClick={() => connect()}>
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill="none"
              stroke={BRAND_COLOR}
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}

      {isConnected && !token && error ? (
        <div className="h-36 w-36">
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill={ERROR_COLOR}
              stroke={ERROR_COLOR}
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}

      {isConnected && !token && !error ? (
        <div
          className="h-36 w-36 cursor-pointer"
          onClick={() =>
            authorize({
              transaction: {
                data: TX_DATA,
                functionSignature: TX_FUNCTION_SIGNATURE,
                targetContract: getHumanBoundContractAddressByNetworkId(
                  chain.id
                ),
              },
            })
          }
        >
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill="none"
              stroke={BRAND_COLOR}
              strokeWidth="4"
            />

            <path
              d="
                M-4, 44
                a1,1 0 0,0 96,0
              "
              fill={BRAND_COLOR}
            />
          </svg>
        </div>
      ) : null}

      {isConnected && token && !error ? (
        <div className="h-36 w-36">
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill={BRAND_COLOR}
              stroke={BRAND_COLOR}
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}
    </main>
  );
};

export default Page;
