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
  const [votingContract, setVotingContract] = useState<ethers.Contract | null>(
    null
  );
  const [storeContract, setStoreContract] = useState<ethers.Contract | null>(
    null
  );

  const setDvmContracts = async () => {
    if (finderAddress !== null && signer !== null) {
      const finder = new ethers.Contract(finderAddress, uma.finder.abi, signer);
      const res = await Promise.all([
        finder.getImplementationAddress(utf8ToHex("Oracle")),
        finder.getImplementationAddress(utf8ToHex("Store")),
      ]);

      const dvmAddress = res[0];
      const storeAddress = res[1];
      const dvm = new ethers.Contract(dvmAddress, uma.voting.abi, signer);
      setVotingContract(dvm);

      const store = new ethers.Contract(storeAddress, uma.store.abi, signer);
      setStoreContract(store);
    }
  };
  useEffect(() => {
    setVotingContract(null);
    setStoreContract(null);

    setDvmContracts();
  }, [finderAddress, signer]);

  return { votingContract, storeContract };
}

const Contract = createContainer(useContract);

export default Contract;
