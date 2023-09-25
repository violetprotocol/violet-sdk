// "use client";

import { VioletContext } from "@/providers/VioletProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import { isAddress } from "@ethersproject/address";

const useViolet = ({ address }: { address: string }) => {
  const client = useContext(VioletContext);

  if (!client) {
    throw new Error("USE_VIOLET_OUTSIDE_PROVIDER");
  }

  const [isEnrolled, setIsEnrolled] = useState<boolean>();

  const updateUserIsEnrolled = useCallback(async () => {
    if (!address) return;

    const isEnrolled = await client.isEnrolled(address);

    setIsEnrolled(isEnrolled);
  }, [address, client]);

  useEffect(() => {
    if (!address) {
      return;
    }

    if (!isAddress(address)) {
      throw new Error("INVALID_ADDRESS");
    }

    updateUserIsEnrolled();
  }, [address, updateUserIsEnrolled]);

  return {
    authorize: client.authorize,
    enroll: client.enroll,
    isEnrolled,
  };
};

export { useViolet };
