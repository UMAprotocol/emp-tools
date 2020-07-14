const fetch = require("node-fetch");
const { utils } = require("ethers");

// TODO: This is a really simple mapping of identifier to URL to query to get latest price for an identifier.
// Future work should blend off-chain prices from different sources similar to how we do it in
// `protocol/financial-templates-lib/price-feed/MedianizerPriceFeed.js`
interface PriceFeedIdentifierMap {
  [identifier: string]: string;
}

// TODO: Currently using the coinbase API instead of CryptoWatch because CryptoWatch has strict CORS
// policy that prevents requests coming from localhost domains.
export const PRICE_FEEDS: PriceFeedIdentifierMap = {
  compusd: "https://api.pro.coinbase.com/products/COMP-USD/trades?limit=1",
  ethbtc: "https://api.pro.coinbase.com/products/ETH-BTC/trades?limit=1",
};

export const getOffchainPrice = async (pricefeedIdentifier: string) => {
  try {
    const response = await fetch(PRICE_FEEDS[pricefeedIdentifier]);
    const json = await response.json();
    return utils.parseEther(json[0].price as string);
  } catch (err) {
    console.error(`Failed to get price for: ${pricefeedIdentifier}:`, err);
  }
};
