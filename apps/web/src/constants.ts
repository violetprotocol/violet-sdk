import {
  arbitrum,
  arbitrumGoerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
} from "@wagmi/core/chains";

const CHAIN_ID = {
  MAINNET: mainnet.id,
  ARBITRUM_GOERLI: arbitrumGoerli.id,
  ARBITRUM: arbitrum.id,
  POLYGON_MUMBAI: polygonMumbai.id,
  OPTIMISM_GOERLI: optimismGoerli.id,
  OPTIMISM: optimism.id,
  POLYGON: polygon.id,
} as const;

// This will be generated from Violet
const CLIENT_ID =
  "be7cbd47d3b070de1dd56185b2e9bd51cdf73491e333a86bb98885c1364b1214";

// This will be generated from the ABI
const TX_FUNCTION_SIGNATURE = "0x50d41df3";
const TX_DATA =
  "0x000000000000000000000000d00f7eddc37631bc7bd9ebad8265b2785465a3b7000000000000000000000000000000000000000000000000000000001adc34a100000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000";
const TX_CONTRACT_ADDRESS = "0xD2678cF600262057f485d12aD8F7c8FB5941EB46";

const LOCAL_API_URL = "http://localhost:8080";

const REDIRECT_URL = "http://localhost:3000/callback";

export {
  CHAIN_ID,
  CLIENT_ID,
  TX_FUNCTION_SIGNATURE,
  TX_DATA,
  TX_CONTRACT_ADDRESS,
  LOCAL_API_URL,
  REDIRECT_URL,
};
