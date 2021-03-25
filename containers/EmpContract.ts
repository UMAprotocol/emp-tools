import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getAbi } from "../utils/getAbi";

import SelectedContract from "./SelectedContract";
import Connection from "./Connection";

function useContract() {
  const { signer } = Connection.useContainer();
  const {
    contract: selectedContract,
    isValid,
  } = SelectedContract.useContainer();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (!selectedContract || !isValid) {
      setContract(null);
      return;
    }
    if (!signer) return;
    const { type, version, address } = selectedContract;
    const abi = getAbi(type, version);
    const instance = new ethers.Contract(address, abi, signer);
    setContract(instance);
  }, [selectedContract, isValid, signer]);

  return { contract };
}

const Contract = createContainer(useContract);

export default Contract;
