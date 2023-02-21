"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const Callback = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = {};

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    localStorage.setItem("violet", JSON.stringify(params));

    window.close();
  }, [searchParams]);

  return null;
};

export default Callback;
