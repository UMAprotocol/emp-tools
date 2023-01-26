// this file takes cues from commons getAbi utility
import assert from "assert";
import { useState, useEffect } from "react";
import { ethers, BigNumber, Bytes, Contract } from "ethers";
// inelegant imports, but this is the only way afaik to work in browser
import emp1 from "@uma/core-1-2/build/contracts/ExpiringMultiParty.json";
import emp2 from "@uma/core-2-0/build/contracts/ExpiringMultiParty.json";
import emp3 from "../blockchain/build/contracts/ExpiringMultiParty.json";
import perp2 from "@uma/core-2-0/build/contracts/Perpetual.json";
import erc20 from "@uma/core-2-0/build/contracts/ExpandedERC20.json";
import { ContractInfo } from "../containers/ContractList";

const { parseBytes32String } = ethers.utils;

type Provider = ethers.providers.Web3Provider;
type Signer = ethers.Signer;

type ContractType = {
  versions: string[];
  types: string[];
  abi: any[];
  getState?: (instance: Contract) => Promise<any>;
};

export const Contracts: ContractType[] = [
  {
    // we could include semver to do compatibilty checks for version strings, but it would add to bundle and this is good enough
    versions: ["1", "1.2.0", "1.2.1", "1.2.2"],
    types: ["EMP", "ExpiringMultiParty"],
    abi: emp1.abi,
    async getState(instance: Contract) {
      return {
        ...(await commonEmpState(instance)),
        disputeBondPct: (await instance.disputeBondPct()) as BigNumber,
        disputerDisputeRewardPct: (await instance.disputerDisputeRewardPct()) as BigNumber,
        sponsorDisputeRewardPct: (await instance.sponsorDisputeRewardPct()) as BigNumber,
      };
    },
  },
  {
    versions: ["2", "2.0.0", "2.0.1", "latest"],
    types: ["EMP", "ExpiringMultiParty"],
    abi: emp2.abi,
    async getState(instance: Contract) {
      return {
        ...(await commonEmpState(instance)),
        disputeBondPct: (await instance.disputeBondPercentage()) as BigNumber,
        disputerDisputeRewardPct: (await instance.disputerDisputeRewardPercentage()) as BigNumber,
        sponsorDisputeRewardPct: (await instance.sponsorDisputeRewardPercentage()) as BigNumber,
      };
    },
  },
  {
    versions: ["2", "2.0.0", "2.0.1", "latest"],
    types: ["Perpetual"],
    abi: perp2.abi,
    async getState(instance: Contract) {
      const state = {
        collateralCurrency: (await instance.collateralCurrency()) as string, // address
        priceIdentifier: (await instance.priceIdentifier()) as Bytes,
        priceIdentifierUtf8: "",
        tokenCurrency: (await instance.tokenCurrency()) as string, // address
        collateralRequirement: (await instance.collateralRequirement()) as BigNumber,
        minSponsorTokens: (await instance.minSponsorTokens()) as BigNumber,
        timerAddress: (await instance.timerAddress()) as string, // address
        cumulativeFeeMultiplier: (await instance.cumulativeFeeMultiplier()) as BigNumber,
        rawTotalPositionCollateral: (await instance.rawTotalPositionCollateral()) as BigNumber,
        totalTokensOutstanding: (await instance.totalTokensOutstanding()) as BigNumber,
        liquidationLiveness: (await instance.liquidationLiveness()) as BigNumber,
        withdrawalLiveness: (await instance.withdrawalLiveness()) as BigNumber,
        currentTime: (await instance.getCurrentTime()) as BigNumber,
        finderAddress: (await instance.finder()) as string, // address
        // new
        fundingRate: (await instance.fundingRate()) as BigNumber,
        // explicitly set null for missing fields
        expirationTimestamp: null,
        expiryPrice: null,
        isExpired: false,
      };
      state.priceIdentifierUtf8 = parseBytes32String(state.priceIdentifier);
      return state;
    },
  },
  {
    versions: ["3"],
    types: ["EMP", "ExpiringMultiParty"],
    abi: emp3.abi,
    async getState(instance: Contract) {
      const state = {
        collateralCurrency: (await instance.collateralCurrency()) as string, // address
        priceIdentifier: (await instance.priceIdentifier()) as Bytes,
        priceIdentifierUtf8: "",
        tokenCurrency: (await instance.tokenCurrency()) as string, // address
        collateralRequirement: (await instance.collateralRequirement()) as BigNumber,
        minSponsorTokens: (await instance.minSponsorTokens()) as BigNumber,
        timerAddress: (await instance.timerAddress()) as string, // address
        // ToDo comment to add
        cumulativeFeeMultiplier: ethers.utils.parseEther("1"),
        rawTotalPositionCollateral: (await instance.totalPositionCollateral()) as BigNumber,
        totalTokensOutstanding: (await instance.totalTokensOutstanding()) as BigNumber,
        liquidationLiveness: (await instance.liquidationLiveness()) as BigNumber,
        withdrawalLiveness: (await instance.withdrawalLiveness()) as BigNumber,
        currentTime: (await instance.getCurrentTime()) as BigNumber,
        // finderAddress: (await instance.finder()) as string, // address
        // new
        // fundingRate: (await instance.fundingRate()) as BigNumber,
        // explicitly set null for missing fields
        expirationTimestamp: (await instance.expirationTimestamp()) as BigNumber,
        expiryPrice: (await instance.expiryPrice()) as BigNumber,
        isExpired: false,
        disputeBondPct: (await instance.disputeBondPercentage()) as BigNumber,
        disputerDisputeRewardPct: (await instance.disputerDisputeRewardPercentage()) as BigNumber,
        sponsorDisputeRewardPct: (await instance.sponsorDisputeRewardPercentage()) as BigNumber,
        ancillaryData: (await instance.ancillaryData()) as Bytes,
      };
      state.priceIdentifierUtf8 = parseBytes32String(state.priceIdentifier);
      return state;
    },
  },
  {
    versions: ["latest"],
    types: ["Erc20"],
    abi: erc20.abi,
  },
];

// This helper function for the getState calls for each contract abi version of emp tools
async function commonEmpState(instance: Contract) {
  const state = {
    expirationTimestamp: (await instance.expirationTimestamp()) as BigNumber,
    collateralCurrency: (await instance.collateralCurrency()) as string, // address
    priceIdentifier: (await instance.priceIdentifier()) as Bytes,
    priceIdentifierUtf8: "",
    tokenCurrency: (await instance.tokenCurrency()) as string, // address
    collateralRequirement: (await instance.collateralRequirement()) as BigNumber,
    minSponsorTokens: (await instance.minSponsorTokens()) as BigNumber,
    timerAddress: (await instance.timerAddress()) as string, // address
    cumulativeFeeMultiplier: (await instance.cumulativeFeeMultiplier()) as BigNumber,
    rawTotalPositionCollateral: (await instance.rawTotalPositionCollateral()) as BigNumber,
    totalTokensOutstanding: (await instance.totalTokensOutstanding()) as BigNumber,
    liquidationLiveness: (await instance.liquidationLiveness()) as BigNumber,
    withdrawalLiveness: (await instance.withdrawalLiveness()) as BigNumber,
    currentTime: (await instance.getCurrentTime()) as BigNumber,
    contractState: Number(await instance.contractState()) as number,
    finderAddress: (await instance.finder()) as string, // address
    expiryPrice: (await instance.expiryPrice()) as BigNumber,
    isExpired: false,
  };
  // This decodes the price identifier so views have a string representation vs bytes.
  // This variable is named based on how its widely named in other parts of codebase
  state.priceIdentifierUtf8 = parseBytes32String(state.priceIdentifier);
  state.isExpired = state.currentTime.gte(state.expirationTimestamp);
  return state;
}

// case insensitive include
function includes(list: string[], str: string) {
  return list.map((x) => x.toLowerCase()).includes(str);
}

export function get(type: string, version: string = "latest") {
  assert(type, "requires a type");
  type = type.toLowerCase();
  version = version.toLowerCase();
  const found = Contracts.find((contract) => {
    return (
      includes(contract.versions, version) && includes(contract.types, type)
    );
  });
  assert(found, `No contract found by type ${type} and version ${version}`);
  return found;
}

export function getAbi(type: string, version: string = "latest") {
  const found = get(type, version);
  assert(
    found.abi,
    `No contract abi found by type ${type} and version ${version}`
  );
  return found.abi;
}

export async function getState(
  { address, type, version }: ContractInfo,
  provider: Provider | Signer
) {
  const { abi, getState } = get(type, version);
  assert(abi, "requires abi");
  assert(getState, "requires getState function");
  const instance = new ethers.Contract(address, abi, provider);
  return getState(instance);
}
