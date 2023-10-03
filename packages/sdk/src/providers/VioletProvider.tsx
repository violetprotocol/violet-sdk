import { createVioletClient } from "@/lib";
import { ReactNode, createContext, useState } from "react";

const VioletContext = createContext<
  | (ReturnType<typeof createVioletClient> & {
      setCurrentClient: (client: ReturnType<typeof createVioletClient>) => void;
    })
  | null
>(null);

const VioletProvider = ({
  children,
  client,
}: {
  children: ReactNode;
  client: ReturnType<typeof createVioletClient>;
}) => {
  const [currentClient, setCurrentClient] =
    useState<ReturnType<typeof createVioletClient>>(client);

  return (
    <VioletContext.Provider value={{ ...currentClient, setCurrentClient }}>
      {children}
    </VioletContext.Provider>
  );
};

export { VioletContext, VioletProvider };
