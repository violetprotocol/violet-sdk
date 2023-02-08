import { useNetwork } from "wagmi";

const useViolet = () => {
  const { chain, chains } = useNetwork();

  console.log(chains);
};

export { useViolet };
