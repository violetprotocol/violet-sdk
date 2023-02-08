"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { environments, useViolet } from "sdk";

const environment = environments.local;
const clientId =
  "be7cbd47d3b070de1dd56185b2e9bd51cdf73491e333a86bb98885c1364b1214";

const Page = () => {
  const { isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { authenticate } = useViolet({ environment, clientId });
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<string>();
  const [hasMounted, setHasMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");

    const error = searchParams.get("error_code");

    if (error) {
      setError(error);
    }

    if (token) {
      setToken(token);
    }

    router.replace("/");
  }, [searchParams, router]);

  if (!hasMounted) return null;

  return (
    <main className="flex h-screen justify-center items-center">
      {!isConnected ? (
        <div className="h-36 w-36 cursor-pointer" onClick={() => connect()}>
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill="none"
              stroke="#9a4cff"
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}

      {isConnected && !token && error ? (
        <div className="h-36 w-36">
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill="#dc2626"
              stroke="#dc2626"
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}

      {isConnected && !token && !error ? (
        <div
          className="h-36 w-36 cursor-pointer"
          onClick={() => authenticate()}
        >
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill="none"
              stroke="#9a4cff"
              strokeWidth="4"
            />

            <path
              d="
                M-4, 44
                a1,1 0 0,0 96,0
              "
              fill="#9a4cff"
            />
          </svg>
        </div>
      ) : null}

      {isConnected && token && !error ? (
        <div className="h-36 w-36">
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill="#9a4cff"
              stroke="#9a4cff"
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}
    </main>
  );
};

export default Page;
