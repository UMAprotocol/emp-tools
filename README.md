# EMP Tools

_Expiring Multi Party is UMA's most current financial smart contract template. This UI is a community-made tool to make interfacing with the protocol easier, please use at your own risk._

Live frontend:

- Staging: https://emp-tools.vercel.app/
- Production: https://tools.umaproject.org/

## Manual testing

First create a `.env` file with the following contents:

```
MAINNET_NODE_URL=https://mainnet.infura.io/v3/<INFURA_API_KEY>
PRIV_KEY=0x123456789...
```

The following instructions will spin up a test chain forked off mainnet and also swap 10 ETH to DAI on Uniswap so that you have a healthy balance of ETH and DAI to test with. You can manually test the dapp with MetaMask in your browser this way.

1. Run `npm run chain`.
2. Copy the private key into MetaMask to access the account and connect to `localhost:8545`. Your balance should be ~990 ETH and a bunch of DAI.
3. Test.

Beware, it might be a bit slow and you might need to "reset" your account on MetaMask to clear the nonce.

## Deployment and Hosting

Every push to the default branch causes a deployment to the primary domain. Every branch and PR pushed is also deployed to a unique subdomain, all thanks to Vercel.

[![Powered by Vercel](./public/powered-by-vercel.svg)](https://vercel.com/?utm_source=uma%2Femp-tools)
