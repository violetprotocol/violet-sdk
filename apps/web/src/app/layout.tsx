import { ReactNode } from "react";
import Providers from "./providers";

import "../styles/globals.css";
import "@violetprotocol/sdk/styles.css";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
