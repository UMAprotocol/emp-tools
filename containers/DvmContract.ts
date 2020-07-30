import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import uma from "@studydefi/money-legos/uma";

import EmpState from "./EmpState";
import Connection from "./Connection";

const { formatBytes32String: utf8ToHex } = ethers.utils;

function useContract() {
  const { signer } = Connection.useContainer();
  const { empState } = EmpState.useContainer();
  const { finderAddress } = empState;
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const setDvmContract = async () => {
    if (finderAddress !== null && signer !== null) {
      const finder = new ethers.Contract(finderAddress, uma.finder.abi, signer);
      const dvmAddress = await finder.getImplementationAddress(
        utf8ToHex("Oracle")
      );
      const dvm = new ethers.Contract(dvmAddress, uma.voting.abi, signer);
      setContract(dvm);
    }
  };
  useEffect(() => {
    setContract(null);

    setDvmContract();
  }, [finderAddress, signer]);

  return { contract };
}

const Contract = createContainer(useContract);

export default Contract;
