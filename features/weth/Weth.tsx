import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
} from "@material-ui/core";
import { FormEvent, useState } from "react";
import { BigNumberish, utils } from "ethers";
import styled from "styled-components";

import WethContract from "../../containers/WethContract";
import Connection from "../../containers/Connection";
import { useEtherscanUrl } from "../../utils/useEtherscanUrl";

enum ACTION_TYPE {
  WRAP,
  UNWRAP,
}

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const Weth = () => {
  const {
    contract: weth,
    wethBalance,
    ethBalance,
  } = WethContract.useContainer();
  const { signer } = Connection.useContainer();

  const [ethAmount, setEthAmount] = useState<BigNumberish | null>(null);
  const [wethAmount, setWethAmount] = useState<BigNumberish | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const etherscanUrl = useEtherscanUrl(hash);

  const _submitTxn = async (
    amount: BigNumberish | null,
    action: ACTION_TYPE
  ) => {
    if (weth) {
      if (amount && utils.parseEther(amount as string).gt(0)) {
        alert(action === ACTION_TYPE.WRAP ? "Wrapping!" : "Unwrapping!");

        setHash(null);
        setSuccess(null);
        setError(null);

        try {
          let tx;
          if (action === ACTION_TYPE.WRAP) {
            tx = await weth.deposit({
              value: utils.parseEther(amount as string),
            });
          } else {
            tx = await weth.withdraw(
              utils.parseEther(amount as string).toString()
            );
          }
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Invalid amount"));
      }
    } else {
      setError(new Error("Please check that you are connected."));
    }
  };

  const handleClick = (e: FormEvent, action: ACTION_TYPE) => {
    e.preventDefault();

    switch (action) {
      case ACTION_TYPE.WRAP:
        _submitTxn(ethAmount, ACTION_TYPE.WRAP);
        break;
      case ACTION_TYPE.UNWRAP:
        _submitTxn(wethAmount, ACTION_TYPE.UNWRAP);
        break;
      default:
        alert("Invalid action!");
    }
  };

  if (!signer) {
    return (
      <Box>
        <Typography>
          <i>Please connect first.</i>
        </Typography>
      </Box>
    );
  }

  return (
    <Box py={4}>
      <Box pt={4}>
        <Typography>WETH: {wethBalance}</Typography>
        <Typography>ETH: {ethBalance}</Typography>
      </Box>
      <Box pt={4}>
        <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => handleClick(e, ACTION_TYPE.WRAP)}
        >
          <TextField
            type="number"
            label="ETH"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            variant="outlined"
            helperText="Keep some ETH unwrapped for transaction fees"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button type="submit" variant="contained">
                    Wrap
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>
      <Box pt={4}>
        <form
          noValidate
          autoComplete="off"
          onSubmit={(e) => handleClick(e, ACTION_TYPE.UNWRAP)}
        >
          <TextField
            type="number"
            label="WETH"
            value={wethAmount}
            onChange={(e) => setWethAmount(e.target.value)}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button type="submit" variant="contained">
                    Unwrap
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>
      {hash && (
        <Box py={4}>
          <Typography>
            <strong>Tx Receipt: </strong>
            {etherscanUrl ? (
              <Link
                href={etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hash}
              </Link>
            ) : (
              hash
            )}
          </Typography>
        </Box>
      )}
      {success && (
        <Box py={4}>
          <Typography>
            <strong>Transaction successful!</strong>
          </Typography>
        </Box>
      )}
      {error && (
        <Box py={2}>
          <Typography>
            <span style={{ color: "red" }}>{error.message}</span>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Weth;
