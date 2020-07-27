import {
  Box,
  TextField,
  Button,
  InputAdornment,
  Typography,
  Grid,
} from "@material-ui/core";
import { FormEvent, useState } from "react";
import { utils } from "ethers";
import styled from "styled-components";

import WethContract from "../../containers/WethContract";
import Connection from "../../containers/Connection";
import Etherscan from "../../containers/Etherscan";

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

const { parseUnits: toWei } = utils;

const Weth = () => {
  const {
    contract: weth,
    wethBalance,
    ethBalance,
  } = WethContract.useContainer();
  const { signer } = Connection.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [ethAmount, setEthAmount] = useState<string>("0");
  const [wethAmount, setWethAmount] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  if (
    weth !== null &&
    wethBalance !== null &&
    ethBalance !== null &&
    signer !== null
  ) {
    const ethAmountToWrap = Number(ethAmount) || 0;
    const wethAmountToUnwrap = Number(wethAmount) || 0;
    const prettyEthBalance = Number(ethBalance).toFixed(4);
    const prettyWethBalance = Number(wethBalance).toFixed(4);

    // Error conditions for ETH wrapping
    const ethAmountAboveBalance = ethAmountToWrap > Number(ethBalance);

    // Error conditions for WETH unwrapping
    const wethAmountAboveBalance = wethAmountToUnwrap > Number(wethBalance);

    const wrapEth = async (e: FormEvent) => {
      e.preventDefault();

      if (ethAmountToWrap > 0) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const amountWei = toWei(ethAmountToWrap.toString());
          let tx = await weth.deposit({
            value: amountWei,
          });
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Amount must be positive"));
      }
    };

    const unwrapWeth = async (e: FormEvent) => {
      e.preventDefault();

      if (wethAmountToUnwrap > 0) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const amountWei = toWei(wethAmountToUnwrap.toString());
          let tx = await weth.withdraw(amountWei);
          setHash(tx.hash as string);
          await tx.wait();
          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Amount must be positive"));
      }
    };

    const handleMax = () => {
      setWethAmount(wethBalance as string);
    };

    return (
      <Box>
        <Box pb={4}>
          <Typography>
            Convert your ETH into WETH to be used as contract collateral. This
            is needed for yUSD. To learn more about WETH see{" "}
            <a
              href="https://weth.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              weth.io
            </a>
            . Be sure to keep some ETH unwrapped for transaction fees.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item md={6} sm={6} xs={12}>
            <Box style={{ height: "100%" }}>
              <Container style={{ height: "100%" }}>
                <Typography variant="h5">Your Wallet</Typography>
                <BalanceElement>
                  <IconAndNameContainer>
                    <TokenIcon src={ETHEREUM_LOGO_URL} />
                    <TokenName>ETH</TokenName>
                  </IconAndNameContainer>
                  <TokenBalance>Ξ {prettyEthBalance}</TokenBalance>
                </BalanceElement>
                <BalanceElement>
                  <IconAndNameContainer>
                    <TokenIcon src={ETHEREUM_LOGO_URL} />
                    <TokenName>WETH</TokenName>
                  </IconAndNameContainer>
                  <TokenBalance>Ξ {prettyWethBalance}</TokenBalance>
                </BalanceElement>
              </Container>
            </Box>
          </Grid>
          <Grid item md={6} sm={6} xs={12}>
            <Box>
              <Container>
                <Typography variant="h5">Wrap & Unwrap</Typography>
                <InputElement>
                  <form
                    style={{ width: "100%" }}
                    noValidate
                    autoComplete="off"
                    onSubmit={(e) => wrapEth(e)}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      label="ETH"
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      variant="outlined"
                      inputProps={{ min: "0", max: ethBalance as string }}
                      error={ethAmountAboveBalance}
                      helperText={
                        ethAmountAboveBalance && `Your ETH balance is too low`
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={
                                ethAmountAboveBalance || ethAmountToWrap <= 0
                              }
                            >
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
                    onSubmit={(e) => unwrapWeth(e)}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      label="WETH"
                      value={wethAmount}
                      onChange={(e) => setWethAmount(e.target.value)}
                      variant="outlined"
                      inputProps={{ min: "0", max: wethBalance as string }}
                      error={wethAmountAboveBalance}
                      helperText={
                        wethAmountAboveBalance && `Your WETH balance is too low`
                      }
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
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={
                                wethAmountAboveBalance ||
                                wethAmountToUnwrap <= 0
                              }
                            >
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
  } else {
    return (
      <Box>
        <Typography>
          <i>Please first connect and select an EMP from the dropdown above.</i>
        </Typography>
      </Box>
    );
  }
};

export default Weth;
