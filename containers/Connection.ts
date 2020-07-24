import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { initOnboard, initNotify } from "./OnboardServices";
import { API as OnboardApi, Wallet } from "bnc-onboard/dist/src/interfaces";
import { API as NotifyApi } from "bnc-notify/dist/src/interfaces";
import { Observable } from "rxjs";
import { debounceTime } from "rxjs/operators";

type Provider = ethers.providers.Provider;
type Block = ethers.providers.Block;
type Network = ethers.providers.Network;
type Signer = ethers.Signer;

function useConnection() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [onboard, setOnboard] = useState<OnboardApi | null>(null);
  const [notify, setNotify] = useState<NotifyApi | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [block$, setBlock$] = useState<Observable<Block> | null>(null);

  const attemptConnection = async () => {
    const onboard = initOnboard({
      address: setAddress,
      network: setNetwork,
      wallet: async (wallet: Wallet) => {
        if (wallet.provider) {
          const ethersProvider = new ethers.providers.Web3Provider(
            wallet.provider
          );
          setProvider(ethersProvider);
          setNetwork(await ethersProvider.getNetwork());
          setSigner(ethersProvider.getSigner());
          await ethersProvider.send("eth_requestAccounts", []);
          setAddress(await ethersProvider.getSigner().getAddress());
          setSelectedWallet(wallet.name);
        } else {
          setProvider(null);
        }
      },
    });
    await onboard.walletSelect();
    setOnboard(onboard);

    setNotify(initNotify());

    if (window.ethereum === undefined) {
      throw Error("MetaMask not found, please visit https://metamask.io/");
    }
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
  }, [provider]);

  return {
    provider,
    onboard,
    notify,
    signer,
    network,
    address,
    selectedWallet,
    connect,
    error,
    block$,
  };
}

const Connection = createContainer(useConnection);

export default Connection;
