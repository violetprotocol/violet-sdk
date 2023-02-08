"use client";

import { useSwitchNetwork, useNetwork, useAccount } from "wagmi";

const environments = {
  local: "local",
  staging: "staging",
  development: "development",
  production: "production",
} as const;

type Environment = (typeof environments)[keyof typeof environments];

const baseUrlByEnvironment = (env: Environment) => {
  switch (env) {
    case environments.local:
      return "http://localhost:8080";
    case environments.staging:
      return "https://staging.k8s.app.violet.co";
    case environments.development:
      return "https://dev.k8s.app.violet.co";
    case environments.production:
      return "https://app.violet.co";
    default:
      throw new Error("INVALID_ENVIRONMENT");
  }
};

const redirectUrlByEnvironment = (env: Environment) => {
  switch (env) {
    case environments.local:
      return "http://localhost:3000";
    case environments.staging:
      return "https://staging.k8s.app.mauve.org/swap";
    case environments.development:
      return "https://dev.k8s.app.mauve.org/swap";
    case environments.production:
      return "https://app.mauve.org/swap";
    default:
      throw new Error("INVALID_ENVIRONMENT");
  }
};

const chainIds = {
  mainnet: 1,
  arbitrum_goerli: 421613,
  arbitrum: 42161,
  polygon_mumbai: 80001,
  optimism_goerli: 420,
  optimism: 10,
  polygon: 137,
} as const;

type ChainId = (typeof chainIds)[keyof typeof chainIds];

const getHumanBoundContractAddressByNetworkId = (cid: ChainId) => {
  switch (cid) {
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

const useViolet = ({
  environment,
  clientId,
}: {
  environment: Environment;
  clientId: string;
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  // const { switchNetwork } = useSwitchNetwork();

  const authenticate = async () => {
    if (!environment || !clientId) {
      throw new Error("INVALID_ENVIRONMENT");
    }

    if (!chain) {
      throw new Error("NO_CHAIN_SELECTED");
    }

    console.log(chain.id);

    // If on local or development environment, switch to test network (Polygon Mumbai)
    if (
      (environment == environments.local ||
        environment == environments.development) &&
      chain.id !== chainIds.arbitrum_goerli
    ) {
      // await switchNetwork?.(chainIds.polygon_mumbai);

      console.log("SWITCH_TO_TEST_NETWORK");

      return;
    }

    const baseApiUrl = baseUrlByEnvironment(environment);

    const redirectUrl = redirectUrlByEnvironment(environment);

    const txTargetContract = getHumanBoundContractAddressByNetworkId(
      chain.id as ChainId
    );

    console.log({ chain, address, txTargetContract, redirectUrl, clientId });

    const authorizationRedirectUrl = `${baseApiUrl}/api/authz/authorize?account_id=eip155:${chain.id}:${address}&dapp_state=null&tx_target_contract=${txTargetContract}&tx_function_signature=0x50d41df3&tx_data=0x000000000000000000000000d00f7eddc37631bc7bd9ebad8265b2785465a3b7000000000000000000000000000000000000000000000000000000001adc34a100000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000&redirect_uri=${redirectUrl}&client_id=${clientId}`;

    if (typeof window !== "undefined") {
      window.location.href = authorizationRedirectUrl;

      return;
    }

    throw new Error("WINDOW_NOT_AVAILABLE");
  };

  return { authenticate };
};

export type { Environment, ChainId };

export { useViolet, environments, chainIds };
