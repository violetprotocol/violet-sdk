import { ReactNode } from "react";
import Modals from "../modals";

const VioletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Modals />

      {children}
    </>
  );
};

export { VioletProvider };
