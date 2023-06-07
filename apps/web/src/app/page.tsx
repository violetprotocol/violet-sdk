"use client";

import { useViolet } from "@violetprotocol/sdk";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useNetwork } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import {
  CHAIN_ID,
  CLIENT_ID,
  TX_FUNCTION_SIGNATURE,
  TX_DATA,
  TX_CONTRACT_ADDRESS,
  LOCAL_API_URL,
  REDIRECT_URL,
} from "../constants";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/Dialog";
import { Input } from "../components/Input";
import { Label } from "../components/Label";

const BRAND_COLOR = "#9a4cff";
const ERROR_COLOR = "#dc2626";

const Page = () => {
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState<string>();
  const [error, setError] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const [apiUrl, setApiUrl] = useState<string>(LOCAL_API_URL);
  const [transactionData, setTransactionData] = useState<string>(TX_DATA);
  const [transactionFunctionSignature, setTransactionFunctionSignature] =
    useState<string>(TX_FUNCTION_SIGNATURE);
  const [transactionTargetContract, setTransactionTargetContract] =
    useState<string>(TX_CONTRACT_ADDRESS);
  const [redirectUrl, setRedirectUrl] = useState<string>(REDIRECT_URL);
  const [clientId, setClientId] = useState<string>(CLIENT_ID);
  const [network, setNetwork] = useState<number>(CHAIN_ID.OPTIMISM_GOERLI);

  const { register, handleSubmit } = useForm<{
    apiUrl: string;
    transactionData: string;
    transactionFunctionSignature: string;
    transactionTargetContract: string;
    redirectUrl: string;
    clientId: string;
  }>({
    defaultValues: {
      apiUrl,
      transactionData,
      transactionFunctionSignature,
      transactionTargetContract,
      redirectUrl,
      clientId,
    },
  });

  const [isFormOpen, setFormOpen] = useState(false);

  const { authorize } = useViolet({
    redirectUrl: redirectUrl,
    clientId: clientId,
    apiUrl: apiUrl,
  });

  // POPUP
  const handleAuthorize = async () => {
    const response = await authorize({
      transaction: {
        data: transactionData,
        functionSignature: transactionFunctionSignature,
        targetContract: transactionTargetContract,
      },
      chainId: chain.id,
      address: address,
    });

    if (!response) return;

    const [eat, error] = response;

    if (error) {
      console.error(error);

      setError(true);
    }

    if (eat) {
      setToken(eat.rawEAT);
    }
  };

  const handleConnect = async () => {
    await connect();
  };

  const handleParametersSubmit = handleSubmit((data) => {
    setApiUrl(data.apiUrl);

    setTransactionData(data.transactionData);

    setTransactionFunctionSignature(data.transactionFunctionSignature);

    setTransactionTargetContract(data.transactionTargetContract);

    setRedirectUrl(data.redirectUrl);

    setClientId(data.clientId);

    setFormOpen(false);
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // REDIRECT
  useEffect(() => {
    const params = {};

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    if (Object.keys(params).length === 0) return;

    const token = searchParams.get("token");

    const error = searchParams.get("error_code");

    if (error) {
      console.error(error);

      setError(true);
    }

    if (token) {
      setToken(token);
    }

    console.table(params);

    router.replace("/");
  }, [searchParams, router]);

  useEffect(() => {
    if (!chain) return;

    if (chain.id === network) return;

    setNetwork(chain.id);
  }, [network, chain]);

  useEffect(() => {
    if (!chain) return;

    setError(false);

    setToken(undefined);
  }, [chain]);

  if (!hasMounted) return null;

  return (
    <main className="flex h-screen justify-center items-center">
      {!isConnected ? (
        <div
          id="NOT_CONNECTED"
          className="h-36 w-36 cursor-pointer"
          onClick={handleConnect}
        >
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill="none"
              stroke={BRAND_COLOR}
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}

      {isConnected && !token && error ? (
        <div id="ERROR" className="h-36 w-36">
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill={ERROR_COLOR}
              stroke={ERROR_COLOR}
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}

      {isConnected && !token && !error ? (
        <div
          id="CONNECTED_NOT_AUTHORIZED"
          className="h-36 w-36 cursor-pointer"
          onClick={handleAuthorize}
        >
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill="none"
              stroke={BRAND_COLOR}
              strokeWidth="4"
            />

            <path
              d="
                M-4, 44
                a1,1 0 0,0 96,0
              "
              fill={BRAND_COLOR}
            />
          </svg>
        </div>
      ) : null}

      {isConnected && token && !error ? (
        <div id="CONNECTED_AND_AUTHORIZED" className="h-36 w-36">
          <svg viewBox="-4 -4 96 96" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="44"
              cy="44"
              r="46"
              fill={BRAND_COLOR}
              stroke={BRAND_COLOR}
              strokeWidth="4"
            />
          </svg>
        </div>
      ) : null}

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="absolute bottom-4 right-4 rounded-full"
          >
            ?
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Edit the parameters</DialogTitle>
            <DialogDescription>
              Make changes to the parameters here, so you can test it properly.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4 py-4" onSubmit={handleParametersSubmit}>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiUrl" className="text-right">
                API URL
              </Label>
              <Input
                id="apiUrl"
                {...register("apiUrl", { required: true })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionData" className="text-right">
                Transaction Data
              </Label>
              <Input
                id="transactionData"
                {...register("transactionData", { required: true })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="transactionFunctionSignature"
                className="text-right"
              >
                Transaction Function Signature
              </Label>
              <Input
                id="transactionFunctionSignature"
                {...register("transactionFunctionSignature", {
                  required: true,
                })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionTargetContract" className="text-right">
                Transaction Target Contract
              </Label>
              <Input
                id="transactionTargetContract"
                {...register("transactionTargetContract", { required: true })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="redirectUrl" className="text-right">
                Redirect URL
              </Label>
              <Input
                id="redirectUrl"
                {...register("redirectUrl", { required: true })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientId" className="text-right">
                Client ID
              </Label>
              <Input
                id="clientId"
                {...register("clientId", { required: true })}
                className="col-span-3"
              />
            </div>

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Page;
