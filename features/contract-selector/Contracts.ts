// Export contracts in the form [address, type, version]
// See getAbi file for full list of versions and types available
export type ContractArguments = [string, string, string];
export const Contracts: { [networkId: number]: ContractArguments[] } = {
  1: [
    ["0x3f2D9eDd9702909Cf1F8C4237B7c4c5931F9C944", "EMP", "1"], // ETHBTC
    ["0x67DD35EaD67FcD184C8Ff6D0251DF4241F309ce1", "EMP", "1"], // yCOMP
    ["0xb56C5f1fB93b1Fbd7c473926c87B6B9c4d0e21d5", "EMP", "1"], // yUSD-SEP20
    ["0xE1Ee8D4C5dBA1c221840c08f6Cf42154435B9D52", "EMP", "1"], // yUSD-OCT20
    ["0xc0b19570370478EDE5F2e922c5D31FAf1D5f90EA", "EMP", "1"], // uUSDrBTC-OCT
    ["0xaBBee9fC7a882499162323EEB7BF6614193312e3", "EMP", "1"], // uUSDrBTC-DEC
    ["0x3605Ec11BA7bD208501cbb24cd890bC58D2dbA56", "EMP", "1"], // uUSDwETH-DEC
    ["0xE4256C47a3b27a969F25de8BEf44eCA5F2552bD5", "EMP", "1"], // YD-ETH-MAR21
    ["0x1c3f1A342c8D9591D9759220d114C685FD1cF6b8", "EMP", "1"], // YD-BTC-MAR21
  ],
  42: [
    ["0x3366b8549047C66E985EcC43026ceD3E831e46A9", "EMP", "1"], // uUSDrBTC Kovan Sep20
    ["0xFb70A4CBD537B36e647553C279a93E969b041DF0", "Perpetual", "2"], //"Perpetual", yUSD Kovan Oct30
    ["0xA000Dfe84A1852865d5231e0F6CBF0De08888abE", "EMP", "1"], // uUSDrBTC Kovan Oct20
    ["0x10E3866b5F52d847F24aaAA14BcAd22b74CC14e2", "EMP", "1"], // uUSDrBTC Kovan Nov20
    ["0x3d7d563F4679C750e462Eae4271d2bd84dF66060", "EMP", "1"], // uUSDrETH Kovan Nov20
  ],
};
