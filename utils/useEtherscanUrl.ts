import Connection from "../containers/Connection";

const networkToEtherscanHostMap = (networkName: string | undefined) => {
    switch(networkName) {
        case "kovan":
            return "https://kovan.etherscan.io";
        case "ropsten":
            return "https://ropsten.etherscan.io";
        case "rinkeby":
            return "https://rinkeby.etherscan.io";
        case "goerli":
            return "https://goerli.etherscan.io";
        default:
            return "https://etherscan.io"
    }
}

export const useEtherscanUrl = (txnHash: string | null) => {
    if (!txnHash) { 
      return undefined; 
    }
    else {
        const { network } = Connection.useContainer();
        const etherscanHost = networkToEtherscanHostMap(network?.name);
    
        return `${etherscanHost}/tx/${txnHash}`;  
    }
};

module.exports = { useEtherscanUrl };

export {};
