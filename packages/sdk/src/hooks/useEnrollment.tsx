"use client";

import { VioletContext } from "@/providers/VioletProvider";
import { isAddress } from "@ethersproject/address";
import { useCallback, useContext, useEffect, useState } from "react";

const useEnrollment = ({ userAddress }: { userAddress?: string }) => {
  const client = useContext(VioletContext);

  if (!client) {
    throw new Error("USE_ENROLL_OUTSIDE_PROVIDER");
  }

  const [isEnrolled, setIsEnrolled] = useState(false);

  const checkEnrollmentStatus = useCallback(async () => {
    if (!userAddress) throw new Error("NO_USER_ADDRESS_DEFINED");

    const isEnrolled = await client.isEnrolled(userAddress);

    setIsEnrolled(isEnrolled);
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
