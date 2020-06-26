import { ethers } from "ethers";
import styled from "styled-components";
import { Box, Button, TextField, Typography } from "@material-ui/core";

import Contract from "../../containers/Contract";
import { useState } from "react";
import useApproveCollateral from "./useApproveCollateral";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpState from "../../containers/EmpState";

const Container = styled(Box)`
  max-width: 720px;
`;

const Red = styled(Typography)`
  color: red;
`;

const Create = () => {
  const { contract: emp } = Contract.useContainer();
  const { symbol: collSymbol } = Collateral.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();
  const { gcr } = EmpState.useContainer();

  const [collateral, setCollateral] = useState<string>("");
  const [tokens, setTokens] = useState<string>("");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { allowance, setMaxAllowance } = useApproveCollateral();

  const mintTokens = async () => {
    if (collateral && tokens && emp) {
      setHash(null);
      setSuccess(null);
      setError(null);
      const collateralWei = ethers.utils.parseUnits(collateral);
      const tokensWei = ethers.utils.parseUnits(tokens);
      try {
        const tx = await emp.create([collateralWei], [tokensWei], {
          gasLimit: 7000000,
        });
        setHash(tx.hash as string);
        await tx.wait();
        setSuccess(true);
      } catch (error) {
        console.error(error);
        setError(error);
      }
    } else {
      setError(new Error("Please check that you are connected."));
    }
  };

  const handleCreateClick = () => mintTokens();

  const computedCR = parseFloat(collateral) / parseFloat(tokens);

  return (
    <Container>
      <Box py={2}>
        <Typography>
          <i>
            Mint new synthetic tokens ({tokenSymbol}) via this EMP contract.
          </i>
        </Typography>
      </Box>

      <Box pb={2}>
        {/* <Box py={2}>
          <Typography variant="h6">Prerequisite</Typography>
        </Box> */}
        <Box py={2}>
          <Typography>
            The EMP needs approval to transfer the collateral currency (
            {collSymbol}) on your behalf. Your current allowance for this EMP
            is: <span>{allowance || "N/A"}</span>
            <br />
            <br />
            <Button variant={"outlined"} onClick={setMaxAllowance}>
              Approve Max
            </Button>
          </Typography>
        </Box>
      </Box>

      <Box pb={2}>
        <Box py={2}>
          <Red>
            <i>Please read this carefully or you may lose money.</i>
          </Red>
        </Box>
        <Box pt={2}>
          <Typography>
            <strong>If this is your first time minting</strong>, ensure that
            your ratio of collateral to tokens is above the GCR and that you are
            minting at least the "minimum sponsor tokens" amount indicated
            above.
          </Typography>
        </Box>
        <Box py={2}>
          <Typography>
            <strong>If you have an existing position</strong>, ensure that your
            collateralization ratio will continue to satisfy the collateral
            requirement percentage indicated above, otherwise you may get
            liquidated.
          </Typography>
        </Box>
        <Box py={2}>
          <Typography>
            When you're ready, fill in the desired amount of collateral and
            tokens below and click the "Create" button.
          </Typography>
        </Box>
      </Box>

      <Box py={2}>
        <TextField
          type="number"
          label={`Collateral (${collSymbol})`}
          placeholder="1234"
          value={collateral}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCollateral(e.target.value)
          }
        />
      </Box>
      <Box py={2}>
        <TextField
          type="number"
          label={`Tokens (${tokenSymbol})`}
          placeholder="1234"
          value={tokens}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTokens(e.target.value)
          }
        />
      </Box>
      <Box py={2}>
        {tokens && collateral ? (
          <Button
            variant="outlined"
            onClick={handleCreateClick}
          >{`Create ${tokens} ${tokenSymbol} with ${collateral} ${collSymbol}`}</Button>
        ) : (
          <Button variant="outlined" disabled>
            Create
          </Button>
        )}
      </Box>

      <Box py={2}>
        {tokens && collateral && gcr ? (
          <Typography>
            CR (collater/tokens):{" "}
            <span style={{ color: computedCR < gcr ? "red" : "unset" }}>
              {computedCR}
            </span>
          </Typography>
        ) : (
          <Typography>CR (collater/tokens): N/A</Typography>
        )}
        <Typography>Current GCR: {gcr || "N/A"}</Typography>
      </Box>

      {hash && (
        <Box py={2}>
          <Typography>
            <strong>Tx Hash: </strong> {hash}
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
    </Container>
  );
};

export default Create;
