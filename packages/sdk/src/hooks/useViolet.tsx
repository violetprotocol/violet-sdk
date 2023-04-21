import { AuthorizeProps, authorize } from "../lib";

type UseVioletProps = {
  clientId: string;
  redirectUrl: string;
  apiUrl?: string;
};

const useViolet = ({ clientId, redirectUrl, apiUrl }: UseVioletProps) => {
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

export type { UseVioletProps };

export { useViolet };
