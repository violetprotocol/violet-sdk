// "use client";

import { VioletContext } from "@/providers/VioletProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import { isAddress } from "@ethersproject/address";

const useEnrollment = ({ userAddress }: { userAddress?: string }) => {
  const client = useContext(VioletContext);

  if (!client) {
    throw new Error("USE_ENROLL_OUTSIDE_PROVIDER");
  }

  const [isEnrolled, setIsEnrolled] = useState(false);

  const checkEnrollmentStatus = useCallback(async () => {
    try {
      if (!userAddress) throw new Error("NO_USER_ADDRESS_DEFINED");

      const isEnrolled = await client.isEnrolled(userAddress);

      setIsEnrolled(isEnrolled);
    } catch (error) {
      console.error(error);
    }
  }, [userAddress, client]);

  useEffect(() => {
    if (!userAddress) return;

    if (!isAddress(userAddress)) {
      throw new Error("INVALID_USER_ADDRESS");
    }

    checkEnrollmentStatus();
  }, [userAddress, checkEnrollmentStatus]);

  return {
    enroll: client.enroll,
    isEnrolled,
    checkEnrollmentStatus,
  };
};

export { useEnrollment };
