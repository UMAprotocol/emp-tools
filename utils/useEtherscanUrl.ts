import Connection from "../containers/Connection";

interface NetworkMap {
  [key: string]: string;
}

const NETWORK_MAP: NetworkMap = {
  kovan: "https://kovan.etherscan.io",
  ropsten: "https://ropsten.etherscan.io",
  rinkeby: "https://rinkeby.etherscan.io",
  goerli: "https://goerli.etherscan.io",
  mainnet: "https://etherscan.io",
};

export const useEtherscanUrl = (txnHash: string | null) => {
  const { network } = Connection.useContainer();
  if (!txnHash || !network) {
    return undefined;
  }

  const baseUrl = NETWORK_MAP[network.name] || NETWORK_MAP["mainnet"];
  return `${baseUrl}/tx/${txnHash}`;
};

module.exports = { useEtherscanUrl };

export {};
