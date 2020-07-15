import { ethers, Wallet, ContractInterface } from "ethers";
import uniswap from "@studydefi/money-legos/uniswap";
import erc20 from "@studydefi/money-legos/erc20";

/**
 * @notice Buys 10 ETH worth of DAI on Uniswap for `wallet`.
 * @param wallet ethers.Wallet object to mint DAI to.
 */
export const getDai = async (wallet: Wallet) => {
  const daiContract = new ethers.Contract(erc20.dai.address, erc20.abi, wallet);

  const uniswapFactoryContract = new ethers.Contract(
    uniswap.factory.address,
    uniswap.factory.abi as ContractInterface,
    wallet
  );

  const daiExchangeAddress = await uniswapFactoryContract.getExchange(
    erc20.dai.address,
    { gasLimit: 4000000 }
  );

  const daiExchangeContract = new ethers.Contract(
    daiExchangeAddress,
    uniswap.exchange.abi as ContractInterface,
    wallet
  );

  // do the actual swapping of 10 ETH to DAI
  const swapTx = await daiExchangeContract.ethToTokenSwapInput(
    1, // min amount of token retrieved
    2525644800, // random timestamp in the future (year 2050)
    {
      gasLimit: 4000000,
      value: ethers.utils.parseEther("10"),
    }
  );
  console.log(`Swapped ETH for DAI: ${swapTx.hash}`);

  const ethAfter = await wallet.getBalance();
  const daiAfter = await daiContract.balanceOf(wallet.address);
  console.log("ETH balance", ethers.utils.formatEther(ethAfter), "ETH");
  console.log("DAI balance", ethers.utils.formatUnits(daiAfter), "DAI");
};
