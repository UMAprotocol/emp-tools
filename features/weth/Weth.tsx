import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
  Grid,
} from "@material-ui/core";
import { FormEvent, useState } from "react";
import { BigNumberish, utils } from "ethers";
import styled from "styled-components";

import WethContract from "../../containers/WethContract";
import Connection from "../../containers/Connection";
import Etherscan from "../../containers/Etherscan";

enum ACTION_TYPE {
  WRAP,
  UNWRAP,
}

const ETHEREUM_LOGO_URL =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const MaxLink = styled.div`
  text-decoration-line: underline;
`;

const TokenIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 13px;
`;

const TokenName = styled.div`
  display: flex;
  align-items: center;
  margin-right: 13px;
`;

const IconAndNameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TokenBalance = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
`;

const BalanceElement = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 16px;
`;

const InputElement = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 20px;
`;

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

const Weth = () => {
  const {
    contract: weth,
    wethBalance,
    ethBalance,
  } = WethContract.useContainer();
  const { signer, notify } = Connection.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [ethAmount, setEthAmount] = useState<BigNumberish | null>(null);
  const [wethAmount, setWethAmount] = useState<BigNumberish | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const _submitTxn = async (amount: string | null, action: ACTION_TYPE) => {
    if (weth) {
      if (amount && utils.parseEther(amount).gt(0)) {
        setHash(null);
        setSuccess(null);
        setError(null);

        try {
          let tx;
          if (action === ACTION_TYPE.WRAP) {
            tx = await weth.deposit({
              value: utils.parseEther(amount),
            });
          } else {
            tx = await weth.withdraw(utils.parseEther(amount).toString());
          }
          setHash(tx.hash as string);
          notify?.hash(tx.hash);
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
        _submitTxn(ethAmount as string, ACTION_TYPE.WRAP);
        break;
      case ACTION_TYPE.UNWRAP:
        _submitTxn(wethAmount as string, ACTION_TYPE.UNWRAP);
        break;
      default:
        alert("Invalid action!");
    }
  };

  const handleMax = () => {
    setWethAmount(wethBalance ? (wethBalance as string) : null);
  };

  if (!signer) {
    return (
      <Box>
        <Typography>
          <i>Please first connect and select an EMP from the dropdown above.</i>
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box pb={4}>
        <Typography>
          Convert your ETH into WETH to be used as contract collateral. This is
          needed for yUSD. To learn more about WETH see{" "}
          <a href="https://weth.io/" target="_blank" rel="noopener noreferrer">
            weth.io
          </a>
          . Be sure to keep some ETH unwrapped for transaction fees.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Box style={{ height: "100%" }}>
            <Container style={{ height: "100%" }}>
              <Typography variant="h5">Your Wallet</Typography>
              <BalanceElement>
                <IconAndNameContainer>
                  <TokenIcon src={ETHEREUM_LOGO_URL} />
                  <TokenName>ETH</TokenName>
                </IconAndNameContainer>
                <TokenBalance>
                  Ξ {ethBalance && Number(ethBalance).toFixed(4)}
                </TokenBalance>
              </BalanceElement>
              <BalanceElement>
                <IconAndNameContainer>
                  <TokenIcon src={ETHEREUM_LOGO_URL} />
                  <TokenName>WETH</TokenName>
                </IconAndNameContainer>
                <TokenBalance>
                  Ξ {wethBalance && Number(wethBalance).toFixed(4)}
                </TokenBalance>
              </BalanceElement>
            </Container>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Container>
              <Typography variant="h5">Wrap and Unwrap</Typography>
              <InputElement>
                <form
                  style={{ width: "100%" }}
                  noValidate
                  autoComplete="off"
                  onSubmit={(e) => handleClick(e, ACTION_TYPE.WRAP)}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="ETH"
                    value={ethAmount ? ethAmount : ""}
                    onChange={(e) => setEthAmount(e.target.value)}
                    variant="outlined"
                    inputProps={{ min: "0" }}
                    InputLabelProps={{
                      shrink: true,
                    }}
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
              </InputElement>
              <InputElement>
                <form
                  style={{ width: "100%" }}
                  noValidate
                  autoComplete="off"
                  onSubmit={(e) => handleClick(e, ACTION_TYPE.UNWRAP)}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="WETH"
                    value={wethAmount ? wethAmount : ""}
                    onChange={(e) => setWethAmount(e.target.value)}
                    variant="outlined"
                    inputProps={{ min: "0" }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Button onClick={() => handleMax()}>
                            <MaxLink>Max</MaxLink>
                          </Button>
                        </InputAdornment>
                      ),
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
              </InputElement>
            </Container>
          </Box>
        </Grid>
      </Grid>

      {hash && (
        <Box py={4}>
          <Typography>
            <strong>Tx Receipt: </strong>
            {hash ? (
              <Link
                href={getEtherscanUrl(hash)}
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
        <Box py={2}>
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
