import { useState, useEffect } from "react";
import { ethers } from "ethers";
import uma from "@studydefi/money-legos/uma";
import erc20 from "@studydefi/money-legos/erc20";

import Connection from "../../containers/Connection";
import { EMPs } from "./EMPs";

export interface Emp {
  name: string;
  address: string;
}

const useEmpList = () => {
  const { signer, provider } = Connection.useContainer();
  const [emps, setEmps] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(false);

  const getEmps = async () => {
    if (signer && provider) {
      setLoading(true);
      // For each EMP address, find its token name and address
      const promises = EMPs.map(async (empAddress: string) => {
        const emp = new ethers.Contract(
          empAddress,
          uma.expiringMultiParty.abi,
          signer
        );
        const tokenAddr = await emp.tokenCurrency();
        const token = new ethers.Contract(tokenAddr, erc20.abi, signer);
        const tokenName = await token.name();
        return {
          name: tokenName,
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
  }, [signer]);

  return {
    emps,
    loading,
  };
};

export default useEmpList;
