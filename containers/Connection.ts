import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { API as OnboardApi, Wallet } from "bnc-onboard/dist/src/interfaces";
import { API as NotifyApi } from "bnc-notify/dist/src/interfaces";
import Onboard from "bnc-onboard";
import Notify from "bnc-notify";
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
    const apiKey = process.env.REACT_APP_ONBOARD_API_KEY
      ? process.env.REACT_APP_ONBOARD_API_KEY
      : "12153f55-f29e-4f11-aa07-90f10da5d778";
    const infuraId =
      process.env.REACT_APP_INFURA_ID || "d5e29c9b9a9d4116a7348113f57770a8";
    const infuraRpc = `https://${network?.name}.infura.io/v3/${infuraId}`;
    const onboard = Onboard({
      dappId: apiKey,
      hideBranding: true,
      networkId: 1, // Default to main net. If on a different network will change with the subscription.
      subscriptions: {
        address: setAddress,
        network: async (networkId: any) => {
          onboard.config({ networkId: networkId });
        },
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
      },
      walletSelect: {
        wallets: [
          { walletName: "metamask", preferred: true },
          {
            walletName: "imToken",
            rpcUrl:
              !!network && network.chainId === 1
                ? "https://mainnet-eth.token.im"
                : "https://eth-testnet.tokenlon.im",
            preferred: true,
          },
          { walletName: "coinbase", preferred: true },
          {
            walletName: "portis",
            apiKey: process.env.REACT_APP_PORTIS_API_KEY,
          },
          { walletName: "trust", rpcUrl: infuraRpc },
          { walletName: "dapper" },
          {
            walletName: "walletConnect",
            rpc: { [network?.chainId || 1]: infuraRpc },
          },
          { walletName: "walletLink", rpcUrl: infuraRpc },
          { walletName: "opera" },
          { walletName: "operaTouch" },
          { walletName: "torus" },
          { walletName: "status" },
          { walletName: "unilogin" },
          // { walletName: "authereum" },
          {
            walletName: "ledger",
            rpcUrl: infuraRpc,
          },
        ],
      },
      walletCheck: [
        { checkName: "connect" },
        { checkName: "accounts" },
        { checkName: "network" },
        { checkName: "balance", minimumBalance: "0" },
      ],
    });

    await onboard.walletSelect();
    setOnboard(onboard);
    setNotify(
      Notify({
        dappId: apiKey ? apiKey : "",
        networkId: network?.chainId || 1,
      })
    );
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
