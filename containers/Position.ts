import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers, BigNumber, BigNumberish } from "ethers";

import Connection from "./Connection";
import EmpContract from "./EmpContract";
import EmpState from "./EmpState";
import Collateral from "./Collateral";
import Token from "./Token";

const fromWei = ethers.utils.formatUnits;
const weiToNum = (x: BigNumberish, u = 18) => parseFloat(fromWei(x, u));

export interface LiquidationState {
  liquidator: string;
  liquidatedCollateral: number;
  lockedCollateral: number;
  liquidationTime: number;
  liquidationTimeRemaining: number;
  liquidationId: number;
  tokensOutstanding: number;
  state: number;
}

function usePosition() {
  const { block$, signer, address } = Connection.useContainer();
  const { contract } = EmpContract.useContainer();
  const { decimals: collDec } = Collateral.useContainer();
  const { decimals: tokenDec } = Token.useContainer();
  const { empState } = EmpState.useContainer();
  const { liquidationLiveness } = empState;

  const [collateral, setCollateral] = useState<number | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [cRatio, setCRatio] = useState<number | null>(null);
  const [withdrawAmt, setWithdrawAmt] = useState<number | null>(null);
  const [withdrawPassTime, setWithdrawPassTime] = useState<number | null>(null);
  const [pendingWithdraw, setPendingWithdraw] = useState<string | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<string | null>(null);
  const [liquidations, setLiquidations] = useState<LiquidationState[] | null>(
    null
  );

  const getPositionInfo = async () => {
    if (
      address &&
      signer &&
      contract &&
      collDec &&
      tokenDec &&
      liquidationLiveness
    ) {
      // Position Data:
      const collRaw: BigNumber = (await contract.getCollateral(address))[0];
      const position = await contract.positions(address);

      const tokensOutstanding: BigNumber = position.tokensOutstanding[0];
      const withdrawReqAmt: BigNumber = position.withdrawalRequestAmount[0];
      const withdrawReqPassTime: BigNumber =
        position.withdrawalRequestPassTimestamp;
      const xferTime: BigNumber = position.transferPositionRequestPassTimestamp;

      const collateral: number = weiToNum(collRaw, collDec);
      const tokens: number = weiToNum(tokensOutstanding, tokenDec);
      const cRatio =
        collateral !== null && tokens !== null
          ? tokens > 0
            ? collateral / tokens
            : 0
          : null;
      const withdrawAmt: number = weiToNum(withdrawReqAmt, collDec);
      const withdrawPassTime: number = withdrawReqPassTime.toNumber();
      const pendingWithdraw: string =
        withdrawReqPassTime.toString() !== "0" ? "Yes" : "No";
      const pendingTransfer: string =
        xferTime.toString() !== "0" ? "Yes" : "No";

      // Liquidation Data: Only include active liquidations
      const liquidations = await contract.getLiquidations(address);
      const updatedLiquidations: LiquidationState[] = [];
      liquidations.forEach((liq: any, id: number) => {
        const liquidationTimeRemaining =
          liq.liquidationTime.toNumber() +
          liquidationLiveness.toNumber() -
          Math.floor(Date.now() / 1000);
        if (liquidationTimeRemaining > 0) {
          updatedLiquidations.push({
            liquidationId: id,
            liquidationTime: liq.liquidationTime.toNumber(),
            liquidationTimeRemaining: liquidationTimeRemaining,
            liquidator: liq.liquidator,
            liquidatedCollateral: weiToNum(
              liq.liquidatedCollateral[0],
              collDec
            ),
            lockedCollateral: weiToNum(liq.lockedCollateral[0], collDec),
            tokensOutstanding: weiToNum(liq.tokensOutstanding[0], tokenDec),
            state: liq.state,
          });
        }
      });

      // set states
      setCollateral(collateral);
      setTokens(tokens);
      setCRatio(cRatio);
      setWithdrawAmt(withdrawAmt);
      setWithdrawPassTime(withdrawPassTime);
      setPendingWithdraw(pendingWithdraw);
      setPendingTransfer(pendingTransfer);
      setLiquidations(updatedLiquidations);
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
      setCRatio(null);
      setWithdrawAmt(null);
      setWithdrawPassTime(null);
      setPendingWithdraw(null);
      setPendingTransfer(null);
      setLiquidations(null);
    }
    getPositionInfo();
  }, [address, signer, contract, collDec, tokenDec]);

  return {
    collateral,
    tokens,
    cRatio,
    withdrawAmt,
    withdrawPassTime,
    pendingWithdraw,
    pendingTransfer,
    liquidations,
  };
}

const Position = createContainer(usePosition);

export default Position;
