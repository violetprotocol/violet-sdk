import { createVioletClient } from "@/lib";
import { ReactNode, createContext } from "react";

const VioletContext = createContext<ReturnType<
  typeof createVioletClient
> | null>(null);

const VioletProvider = ({
  children,
  client,
}: {
  children: ReactNode;
  client: ReturnType<typeof createVioletClient>;
}) => {
  return (
    <VioletContext.Provider value={client}>{children}</VioletContext.Provider>
  );
};

export { VioletContext, VioletProvider };
