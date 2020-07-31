import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import uma from "@studydefi/money-legos/uma";

import EmpState from "./EmpState";
import Connection from "./Connection";

const { formatBytes32String: utf8ToHex } = ethers.utils;

function useContracts() {
  const { provider } = Connection.useContainer();
  const { empState } = EmpState.useContainer();
  const { finderAddress } = empState;
  const [votingContract, setVotingContract] = useState<ethers.Contract | null>(
    null
  );
  const [storeContract, setStoreContract] = useState<ethers.Contract | null>(
    null
  );

  const setDvmContracts = async () => {
    if (finderAddress !== null && provider !== null) {
      const finder = new ethers.Contract(
        finderAddress,
        uma.finder.abi,
        provider
      );
      const [votingAddress, storeAddress] = await Promise.all([
        finder.getImplementationAddress(utf8ToHex("Oracle")),
        finder.getImplementationAddress(utf8ToHex("Store")),
      ]);
      // Do not inject a provider into this contract so that we can make calls from the EMP's address.
      // We will only have read-only access to the Contract, but overriding the `from` address is neccessary for `getPrice` or `hasPrice`.
      // Moreover, we won't be submitting any txns to the DVM.
      const voting = new ethers.Contract(
        votingAddress,
        uma.voting.abi,
        provider
      );
      setVotingContract(voting);

      const store = new ethers.Contract(storeAddress, uma.store.abi, provider);
      setStoreContract(store);
    }
  };
  useEffect(() => {
    setVotingContract(null);
    setStoreContract(null);

    setDvmContracts();
  }, [finderAddress, provider]);

  return { votingContract, storeContract };
}

const Contracts = createContainer(useContracts);

export default Contracts;
