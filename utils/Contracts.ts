import assert from "assert";
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
    ["0x7c4090170aeADD54B1a0DbAC2C8D08719220A435", "EMP", "1"], // Mario Summer Cash
    ["0x56BaBEcb3dCaC063697fE38AB745c10181c56fA6", "EMP", "2"], // Mario Winter Cash
    ["0x52B21a720D5eBeFc7EFA802c7DEAB7c08Eb10F39", "EMP", "2"], // Mario Fall Cash
    ["0x2dE7A5157693a895ae8E55b1e935e23451a77cB3", "EMP", "2"], // BTC Fall Basis
    ["0x772665dce7b347A867F42bcA93587b5400Ae2576", "EMP", "2"], // ETH Fall Basis
    ["0xeE44aE0cff6E9E62F26add74784E573bD671F144", "EMP", "2"], // Zelda Fall Nuts
    ["0xee7f8088d2e67C5b10EB94732F4bB6E26968AC82", "EMP", "2"], // Zelda Candice Cash
    ["0xCef85b352CCD7a446d94AEeeA02dD11622289954", "EMP", "2"], // Zelda Winter Nuts Cash
    ["0x5917C41a355D16D3950FE12299Ce6DFc1b54cD54", "EMP", "2"], // fCASH iFARM
    ["0x7bc1476eeD521c083Ec84D2894a7B7f738c93b3b", "EMP", "2"], // DEXTF Yield Dollar
    ["0xb40BA94747c59d076B3c189E3A031547492013da", "EMP", "2"], // pxUSD
    ["0x312Ecf2854f73a3Ff616e3CDBC05E2Ff6A98d1f0", "EMP", "2"], // O-OCEAN
    ["0x964Be01cCe200e168c4ba960a764cBEBa8C01200", "EMP", "2"], // O-ETH
    ["0x10E018C01792705BefB7A757628C2947E38B9426", "EMP", "2"], // Chickflock btc-dec
    ["0x45788a369f3083c02b942aEa02DBa25C466a773F", "EMP", "2"], // Chickflock eth-dec
    ["0xc07dE54Aa905A644Ab67F6E3b0d40150Bf825Ca3", "EMP", "2"], // Chickflock btc-sept
    ["0xcA9C3d3fA9419C49465e04C49dD38C054fD94712", "EMP", "2"], // Chickflock eth-sept
    ["0xDB2E7F6655de37822c3020a8988351CC76caDAD5", "EMP", "2"], // yUMA-DEC21
    ["0x0f4e2a456aAfc0068a0718E3107B88d2e8f2bfEF", "EMP", "2"], // YD-ETH-JUNE21
    ["0xd9af2d7E4cF86aAfBCf688a47Bd6b95Da9F7c838", "EMP", "2"], // YD-BTC-JUNE21
  ].reverse() as ContractArguments[],
  42: [
    ["0xB8Fff2d31A4Dd44E30dB461289d3e0b48Fd6976f", "EMP", "2"], // DEXTF Yield Dollar
    ["0x3366b8549047C66E985EcC43026ceD3E831e46A9", "EMP", "1"], // uUSDrBTC Kovan Sep20
    ["0xFb70A4CBD537B36e647553C279a93E969b041DF0", "EMP", "1"], // yUSDETH Kovan oct 2030
    ["0x24d15f2607ee56dF752375a63e646cbF8E652aF3", "Perpetual", "2"], //"Perpetual", Test Contract
    ["0xA000Dfe84A1852865d5231e0F6CBF0De08888abE", "EMP", "1"], // uUSDrBTC Kovan Oct20
    ["0x10E3866b5F52d847F24aaAA14BcAd22b74CC14e2", "EMP", "1"], // uUSDrBTC Kovan Nov20
    ["0x3d7d563F4679C750e462Eae4271d2bd84dF66060", "EMP", "1"], // uUSDrETH Kovan Nov20
    ["0x95b597b6fa71f9f42a93b83149b4d835a6176596", "EMP", "2"], // uUSDrETHname Kovan
  ],
  5: [
    ["0xe478461458a6846279005c9416256e230376069f", "EMP", "3"], // sumero emp
    // ["0x4Aad7B81dCc4f765E6F57510e34A1bD00aFCb316", "EMP", "1"],
  ].reverse() as ContractArguments[],
};

export const getByAddress = (address: string, network: number) => {
  assert(Contracts[network], "Invalid Network: " + network);
  const found = Contracts[network].find((info: ContractArguments) => {
    return info[0].toLowerCase() === address.toLowerCase();
  });
  assert(
    found,
    `No contract found by network ${network} and address ${address}`
  );
  return found;
};
