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
    }: AuthorizeProps) =>
      authorize({
        state,
        transaction,
        address,
        chainId,
        clientId,
        redirectUrl,
        apiUrl,
        options,
      }),
  };
};

export type { UseVioletProps };

export { useViolet };
