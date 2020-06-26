import { ethers, BigNumber } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import EmpState from "../../containers/EmpState";
import Connection from "../../containers/Connection";
import { useState, useEffect } from "react";
import EmpAddress from "../../containers/EmpAddress";

const useApproveCollateral = () => {
  const { empAddress } = EmpAddress.useContainer();
  const { empState } = EmpState.useContainer();
  const { signer, address, block$ } = Connection.useContainer();
  const { collateralCurrency: collAddress } = empState;

  const [allowance, setAllowance] = useState<string | null>(null);

  const getAllowance = async () => {
    if (collAddress && signer && empAddress) {
      const contract = new ethers.Contract(collAddress, erc20.abi, signer);
      const decimals: BigNumber = await contract.decimals();
      const rawAllowance: BigNumber = await contract.allowance(
        address,
        empAddress
      );

      if (rawAllowance.eq(ethers.constants.MaxUint256)) {
        setAllowance("Infinity");
      } else {
        const allowance = ethers.utils.formatUnits(rawAllowance, decimals);
        setAllowance(allowance);
      }
    }
  };

  const setMaxAllowance = async () => {
    if (collAddress && signer && empAddress) {
      try {
        const contract = new ethers.Contract(collAddress, erc20.abi, signer);
        // console.log(empAddress, ethers.constants.MaxUint256.toString());
        await contract.approve(empAddress, ethers.constants.MaxUint256);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // get allowance on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getAllowance());
      return () => sub.unsubscribe();
    }
  }, [block$, collAddress, signer, empAddress]);

  // get allowance on setting of collateral addres
  useEffect(() => {
    if (collAddress && empAddress) getAllowance();
  }, [collAddress, empAddress]);

  return { allowance, setMaxAllowance };
};

export default useApproveCollateral;
