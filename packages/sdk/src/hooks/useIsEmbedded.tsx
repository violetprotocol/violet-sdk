// "use client";

import { useState, useLayoutEffect } from "react";

/**
 * @returns {boolean} true if the page is embedded, false otherwise
 * @example
 * import { useIsEmbedded } from "@sushiswap/sdk";
 *
 * const Page = () => {
 *  const isEmbedded = useIsEmbedded();
 *
 *  return (
 *      <div>
 *          {isEmbedded ? "embedded" : "not embedded"}
 *      </div>
 *  )
 * }
 *
 * export default Page;
 *
 *
 * **/
const useIsEmbedded = () => {
  const [size, setSize] = useState<{
    width: number | null;
    height: number | null;
  }>({
    width: null,
    height: null,
  });

  useLayoutEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // add more deterministic rules later on

  if (!size.height) {
    return false;
  }

  if (size.height <= 220) {
    return true;
  }

  return false;
};

export { useIsEmbedded };
