// this file takes cues from commons getAbi utility
import assert from "assert";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
// inelegant imports, but this is the only way afaik to work in browser
import emp1 from "@uma/core-1-2/build/contracts/ExpiringMultiParty.json";
import emp2 from "@uma/core-2-0/build/contracts/ExpiringMultiParty.json";
import perp2 from "@uma/core-2-0/build/contracts/Perpetual.json";
import erc20 from "@uma/core-2-0/build/contracts/ExpandedERC20.json";

type ContractType = {
  versions: string[];
  names: string[];
  abi: any[];
};
export const Contracts: ContractType[] = [
  {
    // we could include semver to do compatibilty checks for version strings, but it would add to bundle and this is good enough
    versions: ["1", "1.2.0", "1.2.1", "1.2.2"],
    names: ["EMP", "ExpiringMultiParty"],
    abi: emp1.abi,
  },
  {
    versions: ["2", "2.0.0", "2.0.1", "latest"],
    names: ["EMP", "ExpiringMultiParty"],
    abi: emp2.abi,
  },
  {
    versions: ["2", "2.0.0", "2.0.1", "latest"],
    names: ["Perp", "Perpetual"],
    abi: perp2.abi,
  },
  {
    versions: ["latest"],
    names: ["Erc20"],
    abi: erc20.abi,
  },
];

// case insensitive include
function includes(list: string[], str: string) {
  return list.map((x) => x.toLowerCase()).includes(str);
}

export function getAbi(name: string, version: string = "latest") {
  assert(name, "requires a name");
  name = name.toLowerCase();
  version = version.toLowerCase();
  const found = Contracts.find((contract) => {
    return (
      includes(contract.versions, version) && includes(contract.names, name)
    );
  });
  assert(
    found && found.abi,
    `No contract abi found by name ${name} and version ${version}`
  );
  return found.abi;
}
