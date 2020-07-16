import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { weth } from "@studydefi/money-legos/erc20";

import Connection from "./Connection";

function useContract() {
  const { signer } = Connection.useContainer();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      const instance = new ethers.Contract(weth.address, weth.abi, signer);
      setContract(instance);
    }
  }, [signer]);

  return { contract };
}

const Contract = createContainer(useContract);

export default Contract;
