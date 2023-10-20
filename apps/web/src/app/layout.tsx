import { ReactNode } from "react";
import Providers from "./providers";

import "@violetprotocol/sdk/styles.css";
import "../styles/globals.css";

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
