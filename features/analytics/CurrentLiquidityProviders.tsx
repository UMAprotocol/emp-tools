import { Typography, Switch } from "@material-ui/core";
import { useState } from "react";

import Balancer from "../../containers/Balancer";
import Token from "../../containers/Token";

// Import client side only to disable serverside rendering for the charts.
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const prettyAddress = (x: string) => {
  return x.substr(0, 4) + "..." + x.substr(x.length - 4, x.length);
};

const CurrentLiquidityProviders = () => {
  const { pool, shares } = Balancer.useContainer();
  const [switchState, setSwitchState] = useState<boolean>(false);
  const { symbol } = Token.useContainer();

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSwitchState(event.target.checked);
  };

  if (shares !== null && pool !== null) {
    const shareArray = Object.keys(shares).map((address) => {
      return {
        address: prettyAddress(address),
        balance: Number(shares[address]),
      };
    });

    const shareArraySorted = shareArray.sort((a, b) =>
      a.balance < b.balance ? 1 : -1
    );
    const totalBPT = shareArray.reduce((a, b) => {
      return a + b.balance;
    }, 0);

    const usdPerBPT = totalBPT != 0 ? pool.liquidity / totalBPT : 0;

    const plotConfig = {
      options: {
        theme: {
          palette: "palette7",
          mode: "dark",
        },
        chart: {
          background: "#303030",
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          categories: shareArraySorted.map(
            (shareHolder) => shareHolder.address
          ),
          title: {
            text: "Sponsor",
            offsetY: -15,
          },
        },
        yaxis: {
          logarithmic: switchState,
          title: {
            text: "USD in pool",
            offsetY: -15,
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
      series: [
        {
          name: "USD in pool",
          data: shareArraySorted.map((shareHolder) =>
            (shareHolder.balance * usdPerBPT).toFixed(2)
          ),
        },
      ],
    };

    return (
      <span>
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
          {symbol} Balancer Liquidity Providers
        </Typography>
        Logarithmic:{" "}
        <Switch checked={switchState} onChange={handleSwitchChange} />
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

export default CurrentLiquidityProviders;
