import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import Connection from "../../containers/Connection";
import { useEffect, useState } from "react";

interface IProps {
  state: string;
}

const Emphasis = styled(Typography)`
  color: ${(p: IProps) => p.state};
  font-style: italic;
`;

const Status = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Cap = styled.span`
  text-transform: capitalize;
`;

const ConnectionStatus = () => {
  const { network, address, signer, block$ } = Connection.useContainer();
  const [blockNum, setBlockNum] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);

  // subscribe to block$ so we can update blockNum
  useEffect(() => {
    if (block$)
      block$.subscribe((block) => {
        setBlockNum(block.number);
        setTime(block.timestamp);
      });
  }, [block$]);

  if (!signer || !network || !address || !time) {
    return (
      <>
        <Emphasis state="#fab127">Please connect to MetaMask</Emphasis>
        <Status>Network: Not Connected</Status>
        <Status>Account: Not Connected</Status>
      </>
    );
  }

  // rename homestead to mainnet for mainstream understanding
  const networkName = network.name === "homestead" ? "Mainnet" : network.name;
  const timeStr = new Date(time * 1000).toLocaleTimeString();
  return (
    <>
      <Emphasis state="#28f71d">
        Updated @ block {blockNum} ({timeStr})
      </Emphasis>
      <Status>
        Network: <Cap>{networkName}</Cap>({network.chainId})
      </Status>
      <Status>Account: {address}</Status>
    </>
  );
};
export default ConnectionStatus;
