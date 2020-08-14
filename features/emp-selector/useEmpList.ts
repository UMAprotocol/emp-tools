import { useState, useEffect } from "react";
import { ethers } from "ethers";
import uma from "@studydefi/money-legos/uma";
import erc20 from "@studydefi/money-legos/erc20";

import Connection from "../../containers/Connection";
import { EMPs } from "./EMPs";

export interface Emp {
  name: string;
  symbol: string;
  address: string;
}

const useEmpList = () => {
  const { signer, network, provider } = Connection.useContainer();
  const [emps, setEmps] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(false);

  // For each EMP address, find its token name and address
  const getEmps = async () => {
    if (provider !== null) {
      setLoading(true);

      // If user is not signed in, then default to mainnet
      let networkIdToUse = 1;

      // If user is signed in, then select EMP's for chosen network
      if (signer && network) networkIdToUse = network.chainId;

      const promises = EMPs[networkIdToUse].map(async (empAddress: string) => {
        const emp = new ethers.Contract(
          empAddress,
          uma.expiringMultiParty.abi,
          signer !== null ? signer : provider
        );
        const tokenAddr = await emp.tokenCurrency();
        const token = new ethers.Contract(
          tokenAddr,
          erc20.abi,
          signer !== null ? signer : provider
        );
        const tokenName = await token.name();
        const tokenSymbol = await token.symbol();
        return {
          name: tokenName,
          symbol: tokenSymbol,
          address: empAddress,
        };
      });

      // set state w/ data
      const emps = await Promise.all(promises);
      setLoading(false);
      setEmps(emps);
    }
  };

  useEffect(() => {
    getEmps();
  }, [signer, network, provider]);

  return {
    emps,
    loading,
  };
};

export default useEmpList;
