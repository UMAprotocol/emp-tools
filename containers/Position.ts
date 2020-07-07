import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumber, BigNumberish } from "ethers";

import Connection from "./Connection";
import EmpContract from "./EmpContract";
import Collateral from "./Collateral";
import Token from "./Token";

const fromWei = ethers.utils.formatUnits;
const weiToNum = (x: BigNumberish, u = 18) => parseFloat(fromWei(x, u));

function usePosition() {
  const { block$, signer, address } = Connection.useContainer();
  const { contract } = EmpContract.useContainer();
  const { decimals: collDec } = Collateral.useContainer();
  const { decimals: tokenDec } = Token.useContainer();

  const [collateral, setCollateral] = useState<number | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [withdrawAmt, setWithdrawAmt] = useState<number | null>(null);
  const [withdrawPassTime, setWithdrawPassTime] = useState<number | null>(null);
  const [pendingWithdraw, setPendingWithdraw] = useState<string | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<string | null>(null);

  const getPositionInfo = async () => {
    if (address && signer && contract && collDec && tokenDec) {
      const collRaw: BigNumber = (await contract.getCollateral(address))[0];
      const position = await contract.positions(address);

      const tokensOutstanding: BigNumber = position.tokensOutstanding[0];
      const withdrawReqAmt: BigNumber = position.withdrawalRequestAmount[0];
      const withdrawReqPassTime: BigNumber =
        position.withdrawalRequestPassTimestamp;
      const xferTime: BigNumber = position.transferPositionRequestPassTimestamp;

      // format data for storage
      const collateral: number = weiToNum(collRaw, collDec);
      const tokens: number = weiToNum(tokensOutstanding, tokenDec);
      const withdrawAmt: number = weiToNum(withdrawReqAmt, collDec);
      const withdrawPassTime: number = withdrawReqPassTime.toNumber();
      const pendingWithdraw: string =
        withdrawReqPassTime.toString() !== "0" ? "Yes" : "No";
      const pendingTransfer: string =
        xferTime.toString() !== "0" ? "Yes" : "No";

      // set states
      setCollateral(collateral);
      setTokens(tokens);
      setWithdrawAmt(withdrawAmt);
      setWithdrawPassTime(withdrawPassTime);
      setPendingWithdraw(pendingWithdraw);
      setPendingTransfer(pendingTransfer);
    }
  };

  // get position info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getPositionInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, address, signer, contract, collDec, tokenDec]);

  // get position info on setting of vars
  useEffect(() => {
    if (contract === null) {
      setCollateral(null);
      setTokens(null);
      setWithdrawAmt(null);
      setWithdrawPassTime(null);
      setPendingWithdraw(null);
      setPendingTransfer(null);
    }
    getPositionInfo();
  }, [address, signer, contract, collDec, tokenDec]);

  return {
    collateral,
    tokens,
    withdrawAmt,
    withdrawPassTime,
    pendingWithdraw,
    pendingTransfer,
  };
}

const Position = createContainer(usePosition);

export default Position;
