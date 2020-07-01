import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";

import Connection from "./Connection";
import Contract from "./Contract";
import { BigNumber } from "ethers";

function usePosition() {
  const { block$, signer, address } = Connection.useContainer();
  const { contract } = Contract.useContainer();

  const [collateral, setCollateral] = useState<BigNumber | null>(null);
  const [tokens, setTokens] = useState<BigNumber | null>(null);
  const [withdrawAmt, setWithdrawAmt] = useState<BigNumber | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<string | null>(null);

  const getPositionInfo = async () => {
    if (address && signer && contract) {
      const collateral = (await contract.getCollateral(address))[0];
      const position = await contract.positions(address);
      const {
        tokensOutstanding,
        withdrawalRequestAmount,
        transferPositionRequestPassTimestamp,
      } = position;
      setCollateral(collateral as BigNumber);
      setTokens(tokensOutstanding[0] as BigNumber);
      setWithdrawAmt(withdrawalRequestAmount[0] as BigNumber);
      setPendingTransfer(
        transferPositionRequestPassTimestamp.toString() !== "0" ? "Yes" : "No"
      );
    }
  };

  // get position info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getPositionInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, address, signer, contract]);

  // get position info on setting of vars
  useEffect(() => {
    if (contract === null) {
      setCollateral(null);
      setTokens(null);
      setWithdrawAmt(null);
      setPendingTransfer(null);
    }
    getPositionInfo();
  }, [address, signer, contract]);

  return { collateral, tokens, withdrawAmt, pendingTransfer };
}

const Position = createContainer(usePosition);

export default Position;
