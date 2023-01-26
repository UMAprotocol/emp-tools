import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { API as OnboardApi, Wallet } from "bnc-onboard/dist/src/interfaces";
import Onboard from "bnc-onboard";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { config } from "./Config";

type Provider = ethers.providers.Web3Provider;
type Block = ethers.providers.Block;
type Network = ethers.providers.Network;
type Signer = ethers.Signer;

const SUPPORTED_NETWORK_IDS: number[] = [1, 5, 42];

function useConnection() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [onboard, setOnboard] = useState<OnboardApi | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [block$, setBlock$] = useState<Observable<Block> | null>(null);

  const attemptConnection = async () => {
    const onboardInstance = Onboard({
      dappId: config(network).onboardConfig.apiKey,
      hideBranding: true,
      networkId: 5, // Default to main net. If on a different network will change with the subscription.
      subscriptions: {
        address: (address: string | null) => {
          setAddress(address);
        },
        network: async (networkId: any) => {
          if (!SUPPORTED_NETWORK_IDS.includes(networkId)) {
            alert("This dApp will work only with the Mainnet or Kovan network");
          }
          onboard?.config({ networkId: networkId });
        },
        wallet: async (wallet: Wallet) => {
          if (wallet.provider) {
            const ethersProvider = new ethers.providers.Web3Provider(
              wallet.provider
            );
            setProvider(ethersProvider);
            setNetwork(await ethersProvider.getNetwork());
          } else {
            setProvider(null);
            setNetwork(null);
          }
        },
      },
      walletSelect: config(network).onboardConfig.onboardWalletSelect,
      walletCheck: config(network).onboardConfig.walletCheck,
    });

    await onboardInstance.walletSelect();
    await onboardInstance.walletCheck();
    setOnboard(onboardInstance);
  };

  const connect = async () => {
    try {
      setError(null);
      await attemptConnection();
    } catch (error) {
      setError(error);
      alert(error.message);
    }
  };

  // create observable to stream new blocks
  useEffect(() => {
    if (provider) {
      const observable = new Observable<Block>((subscriber) => {
        provider.on("block", (blockNumber: number) => {
          provider
            .getBlock(blockNumber)
            .then((block) => subscriber.next(block));
        });
      });
      // debounce to prevent subscribers making unnecessary calls
      const block$ = observable.pipe(debounceTime(1000));
      setBlock$(block$);
    }

    if (provider && address) {
      setSigner(provider.getSigner());
    }
  }, [provider, address]);

  return {
    provider,
    onboard,
    signer,
    network,
    address,
    connect,
    error,
    block$,
  };
}

const Connection = createContainer(useConnection);

export default Connection;
