import { Typography, Switch } from "@material-ui/core";
import { utils } from "ethers";

import EmpState from "../../containers/EmpState";
import Collateral from "../../containers/Collateral";
import EmpSponsors from "../../containers/EmpSponsors";
import PriceFeed from "../../containers/PriceFeed";
import Token from "../../containers/Token";
import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";

// Import client side only to disable serverside rendering for the charts.
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const prettyAddress = (x: string) => {
  return x.substr(0, 4) + "..." + x.substr(x.length - 4, x.length);
};

const CurrentSponsorsCollateralRatio = () => {
  const { empState } = EmpState.useContainer();
  const { priceIdentifier: priceId } = empState;
  const { symbol: collSymbol } = Collateral.useContainer();
  const { activeSponsors } = EmpSponsors.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { symbol } = Token.useContainer();

  if (
    activeSponsors !== null &&
    activeSponsors !== {} &&
    latestPrice !== null &&
    priceId !== null &&
    symbol !== null
  ) {
    const priceIdUtf8 = utils.parseBytes32String(priceId);
    const reformattedSponsorKeys = Object.keys(activeSponsors)
      .filter((sponsor: string) => {
        return (
          activeSponsors[sponsor]?.collateral &&
          activeSponsors[sponsor]?.tokensOutstanding &&
          activeSponsors[sponsor]?.cRatio &&
          activeSponsors[sponsor]?.liquidationPrice
        );
      })
      .sort((sponsorA: string, sponsorB: string) => {
        const fieldValueA = activeSponsors[sponsorA].liquidationPrice;
        const fieldValueB = activeSponsors[sponsorB].liquidationPrice;
        return Number(fieldValueA) > Number(fieldValueB) ? 1 : -1;
      });

    const sponsorArray = reformattedSponsorKeys.map((address) => {
      return {
        address: prettyAddress(address),
        bucket:
          // Note the bucket scalling adapts the width of according to the current liquidation price. This works fine
          //for prices between 100 and 100,000 but might scale badly for very small or very large prices.
          Math.ceil(Number(activeSponsors[address].liquidationPrice) / 5) * 5,
        liquidationPrice: Number(activeSponsors[address].liquidationPrice),
        tokensOutstanding: Number(activeSponsors[address].tokensOutstanding),
        collateral: Number(activeSponsors[address].collateral),
      };
    });

    const invertedPrice = isPricefeedInvertedFromTokenSymbol(symbol);
    const prettyLatestPrice =
      invertedPrice && latestPrice > 0
        ? (1 / latestPrice).toFixed(6)
        : latestPrice.toFixed(6);

    // how much above the current price the x-axis should show until.
    const maxColumnScalingFactor = 1.05;

    const plotConfig = {
      options: {
        theme: {
          palette: "palette7",
          mode: "dark",
        },
        chart: {
          background: "#303030",
          stacked: true,
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          type: "numeric",
          categories: sponsorArray.map((tokenSponsor) => tokenSponsor.bucket),
          tickAmount: 20,
          min: 0,
          max: Number(prettyLatestPrice) * maxColumnScalingFactor,
          title: {
            text: "Liquidation Price",
            offsetY: 15,
          },
        },
        yaxis: {
          title: {
            text: `Position Collateral (${collSymbol})`,
            offsetY: 15,
          },
        },
        plotOptions: {
          bar: {
            columnWidth: Number(prettyLatestPrice) / 3, // scale the column width as a function of price.
          },
        },
        dataLabels: {
          enabled: false,
        },
        annotations: {
          xaxis: [
            {
              x: Number(prettyLatestPrice),
              borderColor: "#fff",
              label: {
                style: {
                  color: "#434343",
                },
                text: `Current ${priceIdUtf8} Price`,
              },
            },
          ],
        },
      },
      series: [
        {
          name: `collateral ${collSymbol}`,
          data: sponsorArray.map((tokenSponsor) =>
            tokenSponsor.collateral.toFixed(2)
          ),
        },
      ],
    };

    return (
      <span>
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
          {symbol} Liquidation Prices vs. Collateral
        </Typography>
        <Chart
          options={plotConfig.options}
          series={plotConfig.series}
          type="bar"
          height={550}
        />
      </span>
    );
  } else {
    return (
      <span>
        Please first connect and select an EMP from the dropdown above.
      </span>
    );
  }
};

export default CurrentSponsorsCollateralRatio;
