import { useEffect, useState } from "react";
import styled from "styled-components";
import formatDistanceToNowStrict from "date-fns/formatDistanceToNowStrict";
import Typography from "@material-ui/core/Typography";

import Connection from "../../containers/Connection";
import { Tooltip } from "@material-ui/core";

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
  const [timeAgo, setTimeAgo] = useState<string | null>(null);

  // subscribe to block$ so we can update blockNum
  useEffect(() => {
    if (block$)
      block$.subscribe((block) => {
        setBlockNum(block.number);
        setTime(block.timestamp);
      });
  }, [block$]);

  const updateTimeAgo = () => {
    if (time) {
      const timeAgoStr = formatDistanceToNowStrict(new Date(time * 1000), {
        addSuffix: true,
        unit: "second",
      });
      setTimeAgo(timeAgoStr);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (time) updateTimeAgo();
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

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
        Updated @ block {blockNum}{" "}
        <Tooltip
          title={`This info is based on the timestamp inside each block that is mined (as opposed to the time that your browser updated).`}
        >
          <span>
            ({timeStr}) {timeAgo}
          </span>
        </Tooltip>
      </Emphasis>
      <Status>
        Network: <Cap>{networkName}</Cap>({network.chainId})
      </Status>
      <Status>Account: {address}</Status>
    </>
  );
};
export default ConnectionStatus;
