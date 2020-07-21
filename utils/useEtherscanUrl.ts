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
  // If the length is 66 then the hex is a transaction.
  if (hex.length == 66) {
    return `${baseUrl}/tx/${hex}`;
  }
  // If the length is 42 then the hex is an address.
  if (hex.length == 42) {
    return `${baseUrl}/address/${hex}`;
  }
  // If the length is neither 66 or 42 then it is invalid.
  return undefined;
};
