import { splitSignature } from "@ethersproject/bytes";
import { EAT } from "..";

const parseEncodedEAT = (base64EncodedEAT: string): EAT => {
  const decodedEAT = JSON.parse(atob(base64EncodedEAT));

  const decodedSignature = decodedEAT?.signature;

  if (!decodedEAT?.signature || !decodedEAT?.expiry) {
    throw new Error("Error handling response from Violet: EAT decoding failed.");
  }

  const signature = splitSignature(decodedSignature);

  return {
    signature,
    expiry: decodedEAT.expiry,
  };
};

export { parseEncodedEAT };
