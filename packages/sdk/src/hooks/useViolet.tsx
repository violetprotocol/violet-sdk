import { AuthorizeProps, authorize } from "../lib";
import { VioletConfigParams } from "../types";

const useViolet = ({ clientId, redirectUrl, apiUrl }: VioletConfigParams) => {
  return {
    authorize: async ({
      state,
      transaction,
      address,
      chainId,
      options,
    }: Pick<
      AuthorizeProps,
      "state" | "transaction" | "address" | "chainId" | "options"
    >) =>
      authorize({
        state,
        transaction,
        address,
        chainId,
        options,
        clientId,
        redirectUrl,
        apiUrl,
      }),
  };
};

export { useViolet };
