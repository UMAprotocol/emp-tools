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

export const useEtherscanUrl = (hex: string | null) => {
  const { network } = Connection.useContainer();

  if (!network || !hex || !network.name) {
    return undefined;
  }
  const baseUrl = NETWORK_MAP[network.name] || NETWORK_MAP["mainnet"];
  if (hex.length == 66) {
    return `${baseUrl}/tx/${hex}`;
  }
  if (hex.length == 42) {
    return `${baseUrl}/address/${hex}`;
  }
  return undefined;
};
