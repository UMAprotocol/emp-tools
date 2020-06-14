import { useState } from "react";
import { ethers, Event } from "ethers";
import uma from "@studydefi/money-legos/uma";
import erc20 from "@studydefi/money-legos/erc20";

import Connection from "../../containers/Connection";

export interface Emp {
  name: string;
  address: string;
}

const useEmpList = () => {
  const { signer, provider } = Connection.useContainer();
  const [emps, setEmps] = useState<Emp[] | null>(null);

  const getEmps = async () => {
    if (signer && provider) {
      // get EMP creation events from EMP Creator
      const empCreator = new ethers.Contract(
        uma.expiringMultiPartyCreator.address,
        uma.expiringMultiPartyCreator.abi,
        signer
      );
      const currBlock = await provider.getBlockNumber();
      const myFilter = empCreator.filters.CreatedExpiringMultiParty(null, null);
      const empCreationEvts = await empCreator.queryFilter(
        myFilter,
        0,
        currBlock
      );

      // For each EMP address, find its token name and address
      const promises = empCreationEvts.map(async (evt: Event) => {
        const empAddress = evt.args && evt.args[0];
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
      setEmps(emps);
      console.log(emps);
    }
  };

  return {
    emps,
    getEmps,
  };
};

export default useEmpList;
