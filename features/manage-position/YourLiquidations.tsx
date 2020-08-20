import styled from "styled-components";
import {
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
} from "@material-ui/core";
import { utils } from "ethers";

import Position, { LiquidationState } from "../../containers/Position";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import EmpState from "../../containers/EmpState";
import Etherscan from "../../containers/Etherscan";

import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";

const { formatUnits: fromWei, parseBytes32String: hexToUtf8 } = utils;

const Container = styled.div`
  margin-top: 20px;
  padding: 1rem;
  border: 1px solid #434343;
`;

const YourLiquidations = () => {
  const { liquidations } = Position.useContainer();
  const { empState } = EmpState.useContainer();
  const { symbol: tokenSymbol } = Token.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();
  const {
    collateralRequirement: collReq,
    priceIdentifier,
    liquidationLiveness,
  } = empState;
  const defaultMissingDataDisplay = "N/A";

  if (
    tokenSymbol !== null &&
    collReq !== null &&
    priceIdentifier !== null &&
    liquidationLiveness !== null &&
    liquidations !== null
  ) {
    const collReqFromWei = parseFloat(fromWei(collReq));
    const priceIdUtf8 = hexToUtf8(priceIdentifier);
    const invertedDisputablePrice = isPricefeedInvertedFromTokenSymbol(
      tokenSymbol
    );

    const liquidationPretty: any[] = [];
    liquidations.map((liq: LiquidationState) => {
      let maxDisputablePrice =
        Number(liq.tokensOutstanding) > 0 && collReqFromWei > 0
          ? Number(liq.liquidatedCollateral) /
            (Number(liq.tokensOutstanding) * collReqFromWei)
          : 0;
      if (invertedDisputablePrice) {
        maxDisputablePrice = 1 / maxDisputablePrice;
      }

      liquidationPretty.push({
        ...liq,
        prettyLiqTimestamp: new Date(
          liq.liquidationTime * 1000
        ).toLocaleString("en-GB", { timeZone: "UTC" }),
        prettyTimeRemainingString:
          Math.floor(liq.liquidationTimeRemaining / 3600) +
          ":" +
          Math.floor((liq.liquidationTimeRemaining % 3600) / 60) +
          ":" +
          ((liq.liquidationTimeRemaining % 3600) % 60),
        maxDisputablePrice: maxDisputablePrice.toFixed(2),
      });
    });

    return renderComponent(
      liquidationPretty,
      priceIdUtf8,
      invertedDisputablePrice
    );
  } else {
    return renderComponent();
  }

  function renderComponent(
    liquidations: LiquidationState[] = [],
    priceIdUtf8: string = defaultMissingDataDisplay,
    invertedDisputablePrice: boolean = false
  ) {
    const prettyAddress = (x: string) => {
      return x.substr(0, 6) + "..." + x.substr(x.length - 6, x.length);
    };

    if (liquidations.length > 0) {
      return (
        <Container>
          <Grid container spacing={4}>
            <Grid item md={6} xs={12}>
              <Typography variant="h5">Your Active Liquidations</Typography>
              {liquidations.map((liq: any, id: number) => {
                return (
                  <Container key={id}>
                    <List
                      dense
                      disablePadding
                      subheader={
                        <ListSubheader>
                          Liquidation ID #{liq.liquidationId + 1}
                        </ListSubheader>
                      }
                    >
                      <ListItem>
                        <ListItemText
                          inset
                          primary={`Liquidation timestamp:`}
                          secondary={`- ${liq.prettyLiqTimestamp}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          inset
                          primary={`Remaining time until liquidation expires:`}
                          secondary={`- ${liq.prettyTimeRemainingString}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          inset
                          primary={`Liquidated by:`}
                          secondary={
                            <a
                              href={getEtherscanUrl(liq.liquidator)}
                              target="_blank"
                            >{`- ${prettyAddress(liq.liquidator)}`}</a>
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          inset
                          primary={`Liquidated collateral:`}
                          secondary={`- ${liq.liquidatedCollateral}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          inset
                          primary={`Liquidated tokens:`}
                          secondary={`- ${liq.tokensOutstanding}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          inset
                          primary={`Disputable at a historical ${priceIdUtf8} price (@  ${
                            liq.prettyLiqTimestamp
                          }) ${invertedDisputablePrice ? `above` : `below`}:`}
                          secondary={`- ${liq.maxDisputablePrice}`}
                        />
                      </ListItem>
                    </List>
                  </Container>
                );
              })}
            </Grid>
          </Grid>
        </Container>
      );
    } else {
      return <></>;
    }
  }
};

export default YourLiquidations;
