import styled from "styled-components";
import { Box, Button, TextField, Typography } from "@material-ui/core";
import { ethers } from "ethers";
import Contract from "../../containers/Contract";
import { useState } from "react";

const Container = styled(Box)`
  max-width: 500px;
`;

const Create = () => {
  const { contract: emp } = Contract.useContainer();

  const [collateral, setCollateral] = useState<string>("");
  const [tokens, setTokens] = useState<string>("");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

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

  return (
    <Container>
      <Box py={2}>
        <Typography>
          <i>Mint new synthetic tokens via this EMP contract.</i>
        </Typography>
      </Box>
      <Box py={2}>
        <Typography>
          <strong>If this is your first time minting</strong>, ensure that your
          ratio of collateral to tokens is above the GCR (noted above) and that
          you are minting at least the "minimum sponsor tokens" amount indicated
          above.
        </Typography>
      </Box>

      <Box py={2}>
        <Typography>
          <strong>If you have an existing position</strong>, ensure that your
          collateralization ratio will continue to satisfy the collateral
          requirement percentage indicated above.
        </Typography>
      </Box>
      <Box py={2}>
        <Typography>
          <strong>Collateral: </strong> Denominated in terms of whole numbers
          (not in Wei). Check above to see the collateral token for this EMP.
        </Typography>
      </Box>
      <Box py={2}>
        <Typography>
          <strong>Tokens: </strong> Denominated in terms of whole numbers (not
          in Wei). Check above to see the synthetic token for this EMP.
        </Typography>
      </Box>
      <Box py={2}>
        <TextField
          type="number"
          label="Collateral"
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
          label="Tokens"
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
          >{`Create ${tokens} tokens with ${collateral} collateral`}</Button>
        ) : (
          <Button variant="outlined" disabled>
            Create
          </Button>
        )}
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
