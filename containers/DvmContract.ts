import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import uma from "@studydefi/money-legos/uma";

import EmpState from "./EmpState";
import Connection from "./Connection";

const { formatBytes32String: utf8ToHex } = ethers.utils;

function useContract() {
  const { provider } = Connection.useContainer();
  const { empState } = EmpState.useContainer();
  const { finderAddress } = empState;
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const setDvmContract = async () => {
    if (finderAddress !== null && provider !== null) {
      const finder = new ethers.Contract(
        finderAddress,
        uma.finder.abi,
        provider
      );
      const dvmAddress = await finder.getImplementationAddress(
        utf8ToHex("Oracle")
      );

      // Do not inject a signer into this contract so that we can make calls from the EMP's address.
      // We will only have read-only access to the Contract, but overriding the `from` address is neccessary for `getPrice` or `hasPrice`.
      // Moreover, we won't be submitting any txns to the DVM.
      const dvm = new ethers.Contract(dvmAddress, uma.voting.abi, provider);
      setContract(dvm);
    }
  };
  useEffect(() => {
    setDvmContract();
  }, [finderAddress, provider]);

  return { contract };
}

const Contract = createContainer(useContract);

export default Contract;
