import { ethers } from "ethers";
type Network = ethers.providers.Network;
export const config = (network: Network | null) => {
  const infuraId =
    process.env.REACT_APP_INFURA_ID || "d5e29c9b9a9d4116a7348113f57770a8";
  const infuraRpc = `https://${network?.name}.infura.io/v3/${infuraId}`;

  return {
    onboardConfig: {
      apiKey:
        process.env.REACT_APP_ONBOARD_API_KEY ||
        "12153f55-f29e-4f11-aa07-90f10da5d778",
      onboardWalletSelect: {
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
    },
  };
};
