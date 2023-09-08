"use client";

import { useState, useLayoutEffect } from "react";
import { checkWindowInIframe } from "../utils/isWindowInIframe";

const MAX_WIDTH = 384;

const MAX_HEIGHT = 416;

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

  const isInIframe = checkWindowInIframe(window);

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

  if (!isInIframe) return false;

  if (!size.width || !size.height) {
    return false;
  }

  if (size.width <= MAX_WIDTH && size.height <= MAX_HEIGHT) {
    return true;
  }

  return false;
};

export { useIsEmbedded, MAX_WIDTH, MAX_HEIGHT };
